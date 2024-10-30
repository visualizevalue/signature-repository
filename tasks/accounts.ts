import { task } from 'hardhat/config'

task('accounts', 'Prints the list of accounts', async (_, hre) => {
  const clients = await hre.viem.getWalletClients()

  for (const client of clients) {
    console.log(client.account.address)
  }
})

