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

  static randomString() {
    const dic = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

    return _.range(0,20)
      .map(_.partial(_.random,0,dic.length-1,false))
      .map(_.partial(this.pick,dic))
      .join('')
  }

  static pick(arr,pos) {
    return arr[pos]
  }
}
