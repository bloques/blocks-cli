import fs from 'fs'
import mkdirp from 'mkdirp'
import path from'path'
import _ from'lodash'

export default class BlockSaver {
  constructor(namespace) {
    this.namespace = namespace
  }

  save(files) {
    return new Promise((resolve,reject) => {
      files.then((filePromises) => {
        let promises = _(filePromises).map(_.bind(this.saveFile,this)).value()
        Promise.all(promises)
          .then(resolve)
          .catch(reject)
      })
    })
  }

  saveFile(file) {
    return new Promise((resolve,reject) => {
      let filePath = path.join(this.blockDirPath(),file.path)
      let dirPath = path.dirname(filePath)
      mkdirp(dirPath, (err) => {
        if (err) return reject(err)
        file.read().then((content) => {
          fs.writeFile(filePath,content,(err,data) => {
            if (err) return reject(err)
            resolve()
          })
        })
      })

    })
  }

  blockDirPath() {
    return path.join(this.vendorBlocksDirPath(),this.namespace)
  }

  vendorBlocksDirPath() {
    return path.join('blocks','vendor')
  }
}
