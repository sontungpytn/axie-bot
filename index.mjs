import express from 'express'
import dotenv from 'dotenv'
import ethers from 'ethers'
import bodyParser from 'body-parser'
import {GraphQLClient} from 'graphql-request'
import {GetAxieDetail} from './graphql/query.mjs'

const ZERO_BN = ethers.constants.Zero;
const MAX_UINT256 = ethers.constants.MaxUint256;

// Load environment
dotenv.config()

const app = express()
app.use(bodyParser.json())

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000


const addresses = {
    router: '0x213073989821f738a7ba3520c3d31a1f9ad31bbd', // Marketplace address
    token: '0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5', // Ronin Token address,
    weth: '0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5'
}

const endpoint = 'https://axieinfinity.com/graphql-server-v2/graphql'
const graphQLClient = new GraphQLClient(endpoint, {})
const passPhrase = process.env.PASS_PHRASE


// Get account from pass phrase
const jsonRpcProvider = new ethers.providers.JsonRpcProvider('https://api.roninchain.com/rpc')
const wallet = ethers.Wallet.fromMnemonic(passPhrase)
const account = wallet.connect(jsonRpcProvider)
console.log(`Connected to account ${account.address}`)

const router = new ethers.Contract(
    addresses.router,
    [
        'function settleAuction ( address _seller, address _token, uint256 _bidAmount, uint256 _listingIndex, uint256 _listingState ) external'
    ],
    account
)

const weth = new ethers.Contract(
    addresses.weth,
    [
        'function approve ( address _spender, uint256 _value ) external returns ( bool )',
        'function allowance (address owner, address delegate) external view returns (uint)'
    ],
    account
)

// allow marketplace using weth
const approve = async value => {
    console.log('Approve value ', value)
    const approveTx = await weth.approve(
        router.address,
        ethers.BigNumber.from(value)
    )

    const receipt = await approveTx.wait()
    console.log('Transaction receipt')
    console.log(receipt)
    return receipt
}


app.get('/allowance', async (req, res) => {
    const transaction = await weth.allowance(
        account.address,
        router.address
    )
    //
    console.log(transaction)
    return res.json({
        value: transaction.toString()
    })
})

app.post('/approve', async (req, res) => {
    const {value} = req.body
    const tx = await approve(value)
    return res.json({
        transaction: tx
    })
})

/**
 * Buy axie buy id
 *
 * @param body.id ID of axie
 */
app.post('/buy', async (req, res) => {
    try {
        const {id} = req.body
        const axieData = await graphQLClient.request(GetAxieDetail, {
            axieId: id
        })
        const auction = axieData?.axie?.auction
        console.table(auction)
        if (auction) {

            const price = auction.currentPrice
            const tx = await router.settleAuction(
                auction.seller,
                addresses.token,
                price,
                auction.listingIndex,
                auction.state
            )
            const transaction = await tx.wait()
            return res.json({
                success: true,
                message: '',
                transaction
            })
        } else {
            return res.status(404).json({
                success: false,
                message: 'Auction not found'
            })
        }
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.toString()
        })
    }
})

app.listen(port, host, () => {
    console.log(`Server started on ${host}:${port}`)
})

