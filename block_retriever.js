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
        let files = _(dir).filter({type: 'file'}).value()
        let dirs = _(dir).filter({type: 'dir'}).value()

        let filePromises = _(files).map(_.bind(this.buildPromiseForFile,this)).value()

        let dirPromises = _(dirs).pluck('path').map(_.bind(this.filesForDir,this)).value()

        Promise.all(dirPromises).then((result) => {
          resolve(_.flattenDeep(filePromises.concat(result)))
        })

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
