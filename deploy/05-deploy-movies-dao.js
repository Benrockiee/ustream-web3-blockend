const { network } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let streamTokenAddress

    const streamToken = await deployments.get("StreamToken")
    streamTokenAddress = streamToken.address

    const args = [
        networkConfig[chainId].entryFee,
        networkConfig[chainId].votingStartTime,
        networkConfig[chainId].thursdayVotingEndTime,
        streamTokenAddress,
    ]
    const moviesDao = await deploy("MoviesDao", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...")
        await verify(moviesDao.address, args)
    }

    log("-------------------------------")
}

module.exports.tags = ["all", "movies-dao"]
