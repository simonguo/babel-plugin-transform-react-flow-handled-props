import _ from 'lodash'
import * as t from 'babel-types'
import {
  getClassDeclaration,
  getEntryIdentifier,
  getExpressionIdentifier,
  isArrayValue,
  isObjectProperty,
  isObjectValue,
  isStaticProperty,
  isValidExpression,
  isValidProperty,
} from '../util'

const getArrayItems = ({ elements }) => _.map(elements, ({ value }) => value)

const getObjectKeys = ({ properties }) => {
  const objectProperties = _.filter(properties, isObjectProperty)

  return _.map(objectProperties, ({ key: { name } = {} }) => name)
}

const getTypeAlias = (path, name) => {
  const body = _.get(path, 'parent.body') || []
  const type = body.filter(item => _.get(item, 'id.name') === name)
  return _.get(type, '0')
}

const getParams = path => {
  const params = _.get(path, 'node.right.typeParameters.params') || []
  return params.map(item => _.get(item, 'id.name'))
}

const getTypesByProperties = properties => {
  return properties.map(item => {
    let type = _.get(item, 'key.type')
    if (type === 'StringLiteral') {
      return _.get(item, 'key.value')
    } else if (type === 'Identifier') {
      return _.get(item, 'key.name')
    }
    return
  })
}

const getFlowTypeKeys = path => {
  if (_.get(path, 'node.right.id.name') === '$Diff') {
    const params = getParams(path) || []
    const types = []
    params.map(name => {
      const item = getTypeAlias(path, name)
      types.push(...getTypesByProperties(_.get(item, 'right.properties') || []))
    })
    return types
  }

  if (_.get(path, 'node.id.name') !== 'Props') {
    return []
  }

  const properties = _.get(path, 'node.right.properties') || []

  return getTypesByProperties(properties)
}

const getTypeAliasIdentifier = path => {
  const body = _.get(path, 'parent.body')
  if (!body) {
    return Object.keys(_.get(path, 'state.entries'))[0]
  }
  return _.get(body.find(item => item.type === 'ClassDeclaration'), 'id.name')
}

const propVisitor = {
  TypeAlias(path, state) {
    const identifier = getTypeAliasIdentifier(path)

    if (!state.hasEntry(identifier)) return

    state.addProps(identifier, getFlowTypeKeys(path))
  },
  AssignmentExpression(path, state) {
    const identifier = getExpressionIdentifier(path)
    const right = _.get(path, 'node.right')

    if (!state.hasEntry(identifier)) return

    if (isValidExpression(path, ['handledProps']) && isArrayValue(right)) {
      state.addProps(identifier, getArrayItems(right))
      path.remove()
      return
    }

    if (isValidExpression(path, ['defaultProps', 'propTypes'])) {
      if (isObjectValue(right)) {
        state.addProps(identifier, getObjectKeys(right))
      } else if (t.isIdentifier(right)) {
        const name = _.get(right, 'name')
        const properties = _.get(path, `scope.bindings.${name}.path.node.init.properties`) || []
        const keys = properties.map(item => _.get(item, 'key.name'))
        state.addProps(identifier, keys)
      }
    }
  },
  ClassProperty(path, state) {
    const expression = getClassDeclaration(path)
    const identifier = getEntryIdentifier(expression)
    const value = _.get(path, 'node.value')

    if (!state.hasEntry(identifier) || !isStaticProperty(path)) return

    if (isValidProperty(path, ['handledProps']) && isArrayValue(value)) {
      state.addProps(identifier, getArrayItems(value))
      path.remove()

      return
    }

    if (isValidProperty(path, ['defaultProps', 'propTypes']) && isObjectValue(value)) {
      state.addProps(identifier, getObjectKeys(value))
    }
  },
}

export default propVisitor
