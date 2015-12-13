import fs from 'fs'
import mkdirp from 'mkdirp'
import path from 'path'
import _ from 'lodash'
import Utils from './utils'

export default class BlockSaver {
  constructor(namespace) {
    this.namespace = namespace
  }

  save(files) {
   return files.then((filePromises) => {
      let promises = _(filePromises)
        .map(this.saveFile,this)
        .value()

      return Promise.all(promises)
    })
  }

  saveFile(file) {

    let filePath = path.join(this.blockDirPath(),file.path)
    let dirPath = path.dirname(filePath)

    return Utils.promisify(mkdirp,mkdirp)(dirPath)
      .then(_.noop)
      .then(Utils.promisify(file,file.read))
      .then(_.partial(Utils.promisify(fs,fs.writeFile),filePath))
  }

  blockDirPath() {
    return path.join(this.vendorBlocksDirPath(),this.namespace)
  }

  vendorBlocksDirPath() {
    return path.join('blocks','vendor')
  }
}
