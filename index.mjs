import express from 'express'
import dotenv from 'dotenv'
import ethers from 'ethers'
import bodyParser from 'body-parser'
import {GraphQLClient} from 'graphql-request'
import {GetAxieDetail} from './graphql/query.mjs'

// Load environment
dotenv.config()

const app = express()
app.use(bodyParser.json())

const host = process.env.HOST || 'localhost'
const port = process.env.PORT || 3000


const addresses = {
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E', // Marketplace address
    token: '0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5' // Ronin Token address
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
            const tx = await router.settleAuction(
                auction.seller,
                addresses.token,
                auction.currentPrice,
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
