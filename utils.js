import _ from 'lodash'

export default class Utils {
  static promisify(funcThis,func) {
    return function() {
      let funcArgs = _.map(arguments,_.identity)
      return new Promise((resolve,reject) => {
        let cb = (err,result) => {
          if(err) return reject(err)
          return resolve(result)
        }
        return func.apply(funcThis,funcArgs.concat(cb))
      })
    }
  }
}
