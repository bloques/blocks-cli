import program from 'commander'
import path from 'path'
import inquirer from 'inquirer'
import Octokat from 'octokat'
import _ from 'lodash'
import fs from 'fs'

import BlockRetriever from './block_retriever'
import BlockSaver from './block_saver'
import Utils from './utils'

const BLOCK_LOCATION_REGEX = /^([\.\w-]+)\/([\.\w-]+)\:([\.\w-]+)$/i

export default class BlockCli {
  blockLocationRegex() {
    return BLOCK_LOCATION_REGEX
  }

  get(githubUser,githubRepo,blockName) {

    let readFile = Utils.promisify(fs,fs.readFile)
    readFile(self.tokenFilePath()).then((token) => {
      const blockRetriever = new BlockRetriever(githubUser,githubRepo,blockName,token || process.env.GITHUB_TOKEN || '')
      const blockSaver = new BlockSaver(path.join(githubUser,githubRepo))
      return blockSaver.save(blockRetriever.files())
    })
  }
  parseGetOption(option) {
    let match = this.blockLocationRegex().exec(option)
    return match.slice(1)
  }

  getCommand(url) {
    this.get.apply(this,this.parseGetOption(url))
      .then( () => {
        console.log('Block downloaded')
      })
      .catch( (err) => {
        console.log('Something went wrong :(')
        console.log(err)
      })
  }

  loginCommand() {
    const questions = [
      {type: 'input',name: 'username',message: 'Github username'},
      {type: 'password',name: 'password',message: 'Github password'},
    ]
    inquirer.prompt(questions, (answers) => {
      this.loginWithGithub(answers['username'],answers['password'])
    });
  }

  loginWithGithub(username,password) {
    const octo = new Octokat({username:username,password:password})
    octo.authorizations
      .create({note: 'Authorization for block cli',fingerprint:Utils.randomString()})
      .then(_.property('token'))
      .then(_.partial(Utils.promisify(fs,fs.writeFile),this.tokenFilePath()))
      .then(_.constant('Authenticated'))
      .then(console.log)
      .catch(console.log)

  }

  run() {
    program
      .version('0.0.1')
      .option('-g, --get <url>', 'Location of the block',this.blockLocationRegex())
      .option('-l, --login', 'Login with github')
      .parse(process.argv)

    if(program.get) {
      this.getCommand(program.get)
    } else if(program.login) {
      this.loginCommand()
    }
  }

  //private
  tokenFilePath() {
    return '.gh_token'
  }

}
