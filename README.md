# review-reward-project
Thesis project to build a Restaurant review system on two polygon blockchian linked by Chainbridge.

# Setup
Intall NodeJS and npm.

Install Go:

```bash
wget https://golang.org/dl/go1.19.4.linux-amd64.tar.gz
sudo tar -C /usr/local -xvf go1.19.4.linux-amd64.tar.gz
#set paths in your environment
sudo nano ~/.bashrc
#at the and of the file add
export PATH=$PATH:/usr/local/go/bin
#check the installation
go verision
```

Clone the Chainbridge-example repository:

```bash
git clone https://github.com/ChainSafe/chainbridge-core-example
```

Go in the cloned repository and build the executable file:
```bash
cd chainbridge-core-example/
make build
```
Create the keystore file for each relyer:

```bash
./chainbridge-core-example evm-cli accounts import --private-key "<relayer 1 private key>" --password "<password>"
mv <address.key> keys/
```

Create a configuration file in JSON and save the file in the config folder:

```json
{
  "relayer": {},
  "chains": [
    {
      "name": "network1",
      "type": "evm",
      "id": 1,
      "endpoint": "RPC-ENDPOINT of the network",
      "from": "Relayer address",
      "bridge": "Bridge smart contract address",
      "erc20Handler": "ERC20 Handler smart contract address",
      "gasLimit": 9000000,
      "maxGasPrice": 2000000000,
      "blockConfirmations": 10
    },
    {
      "name": "network2",
      "type": "evm",
      "id": 2,
      "endpoint": "RPC-ENDPOINT of the network",
      "from": "Relayer address",
      "bridge": "Bridge smart contract addressb",
      "erc20Handler": "ERC20 Handler smart contract address",
      "gasLimit": 9000000,
      "maxGasPrice": 20000000000,
      "blockConfirmations": 10
    }
  ]
}
```

# How to run
**IMPORTANT**
Update the file "templateConstants.js" and rename it in "constants.js"

After the constats.js file update follow the next instructions.

To deploy the Chainbridge infratructure on the first chain:

`npm run deploy:poe1`

To deploy the Chainbridge infratructure on the second chain:

`npm run deploy:poe2`

To deploy the restaurant contracts on both chains:

`npm run deploy`

To test a full cycle Pay-Permission and then Review-Reward run:

`npm run test:full`

