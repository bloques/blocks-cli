import program from 'commander'
import path from 'path'

import BlockRetriever from './block_retriever'
import BlockSaver from './block_saver'

const BLOCK_LOCATION_REGEX = /^([\.\w-]+)\/([\.\w-]+)\:([\.\w-]+)$/i

export default class BlockCli {
  blockLocationRegex() {
    return BLOCK_LOCATION_REGEX
  }

  get(githubUser,githubRepo,blockName) {

    const blockRetriever = new BlockRetriever(githubUser,githubRepo,blockName,process.env.GITHUB_TOKEN)
    const blockSaver = new BlockSaver(path.join(githubUser,githubRepo))
    return blockSaver.save(blockRetriever.files())
  }
  parseGetOption(option) {
    let match = this.blockLocationRegex().exec(option)
    return match.slice(1)
  }

  run() {
    program
      .version('0.0.1')
      .option('-g, --get <url>', 'Location of the block',this.blockLocationRegex())
      .parse(process.argv)

    if (program.get) {
      this.get.apply(this,this.parseGetOption(program.get))
        .then( () => {
          console.log('Block downloaded')
        })
        .catch( (err) => {
          console.log('Something went wrong :(')
          console.log(err)
        })
    }
  }

}
