import Octokat from 'octokat'
import path from'path'
import _ from'lodash'

export default class BlockRetriever {

  constructor(githubUserName,repoName,blockName,token) {

    this.octokat = new Octokat({token: token})
    this.githubUserName = githubUserName
    this.repoName = repoName
    this.blockName = blockName

    this.repo = this.octokat.repos(githubUserName,repoName)

  }

  filesForDir(dir) {
    return new Promise((resolve,reject)=> {
      let fileFetcher = this.repo.contents(dir).fetch()

      fileFetcher.then((dir) => {

        let filePromises = _(dir)
          .filter({type: 'file'})
          .map(this.buildPromiseForFile,this)
          .value()

        let dirPromises = _(dir)
          .filter({type: 'dir'})
          .pluck('path')
          .map(this.filesForDir,this)
          .value()

        return Promise.all(dirPromises)
          .then(_.bind(filePromises.concat,filePromises))
          .then(_.flattenDeep)
          .then(resolve)

      }).catch((err) => {
        reject(err)
      })
    })
  }

  files() {
    return this.filesForDir(this.blocksDirPath())
  }

  buildPromiseForFile(file) {
    return {
      path: file.path,
      read: this.repo.contents(file.path).read
    }
  }

  blocksDirPath() {
    return path.join('blocks',this.blockName)
  }

}
