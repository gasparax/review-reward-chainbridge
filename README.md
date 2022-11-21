# review-reward-project
Thesis project to build a Restaurant review system on two polygon blockchian linked by Chainbridge.

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

