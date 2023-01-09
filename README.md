# Review Reward with Chainbridge
Thesis project to build a Restaurant review system on two polygon blockchian linked by Chainbridge.

# Setup - Networks
Use the Polygon Edge documentation as support:
https://wiki.polygon.technology/docs/edge/get-started/set-up-ibft-locally
```bash
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```
Create a folder to store the networks
```bash
mkdir networks
```
Create all the nodes of the first network
```bash
polygon-edge secrets init --data-dir network1/test-chain-1
#Output
[SECRETS INIT]
Public key (address) = 0xc7D7D3080d8a47815913df6b59BC28fbF6DD574B
BLS Public key       = 0xb28b2c0ede7dbc5d3adaf27c3cfeb4e5fbe49554a6a0aafec5b625785f658cf73b26468a2a1fde6c26a31e89a53df6ce
Node ID              = 16Uiu2HAmJiuSq5WMCh7xNcuXW6bQRQzhpH6F7vryY3zAXM63NCVx
```
Repeat this operation for at least 4 times.
To create the connection string for specifying the bootnode, we will need to conform to the multiaddr format:
```bash
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```
```bash
ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJiuSq5WMCh7xNcuXW6bQRQzhpH6F7vryY3zAXM63NCVx
```

Create the genesis file, give 1000 ETH to the first 2 nodes and set the block gas limit. In the network1 directory run:
```bash
polygon-edge genesis --pos --epoch-size 10000 --consensus ibft --ibft-validators-prefix-path test-chain- --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJiuSq5WMCh7xNcuXW6bQRQzhpH6F7vryY3zAXM63NCVx --premine=0xc7D7D3080d8a47815913df6b59BC28fbF6DD574B:1000000000000000000000 --premine=0xf9A3f7f1CCBA236DC62f5046e83Efc5ed1292752:1000000000000000000000 --block-gas-limit 100000000000000000
```
Run all the nodes
```bash
rm -r -rf test-chain-*/blockchain test-chain-*/trie && rm test-chain-*/consensus/metadata && rm test-chain-*/consensus/snapshots
```
```bash
for i in $(ls default-*.json); do (gnome-terminal --tab -- polygon-edge server --config $i &); done
```

**For the second network**
Go in the networks directory and repeat the node creation phase:
```bash
polygon-edge secrets init --data-dir network2/test-chain-1
```
Create the genesis file, give 1000 ETH to the first 2 nodes and set the block gas limit. In the network2 directory run:
```bash
polygon-edge genesis --pos --epoch-size 10000 --consensus ibft --ibft-validators-prefix-path test-chain- --bootnode /ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmTsrYAoxX5iCfGYi63C46K7Qn8uDeSYiixFos4pbwwh77 --premine=0xE065b939F18CB5f83F36EFf9E1F9E370055A07C1:1000000000000000000000 --premine=0x19398539F279E97028FcfF5A05698270a2dD4182:1000000000000000000000 --block-gas-limit 100000000000000000
```

Run all the nodes
```bash
rm -r -rf test-chain-*/blockchain test-chain-*/trie && rm test-chain-*/consensus/metadata && rm test-chain-*/consensus/snapshots
```
```bash
for i in $(ls default-*.json); do (gnome-terminal --tab -- polygon-edge server --config $i &); done
```
# Setup - Relayers
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

