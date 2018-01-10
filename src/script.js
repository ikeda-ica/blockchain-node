'use strict'

const
    crypto = require('crypto'),
    uuid = require('node-uuid'),
    express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    upload = multer()

class Blockchain {
    constructor() {
        this.chain = []
        this.current_transactions = {}
        this.new_block(100, 1)
    }

    __init__() {
    }

    new_block(proof, previous_hash) {
        const block = {
            'index': Object.keys(this.chain).length + 1,
            'timestamp': new Date(),
            'transactions': this.current_transactions,
            'proof': proof,
            'previous_hash': previous_hash,
        }

        this.current_transactions = []
        this.chain.push(block)
        return block
    }

    new_transaction(sender, recipient, amount) {
        this.current_transactions.push({
            'sender': sender,
            'recipient': recipient,
            'amount': amount,
        })

        const last_block = blockchain.last_block()
        return last_block['index'] + 1
    }

    last_block() {
        return this.chain[ Object.keys(this.chain).length - 1 ]
    }

    hash() {
        const block_string = '' + this.block
        const shasum = crypto.createHash('sha256')
        return shasum.update(block_string).digest('hex')
    }

    valid_proof(last_proof, proof){
        const guess = '' + last_proof + proof
        const guess_hash = crypto.createHash('sha256').update(guess).digest('hex')
        return guess_hash.slice( 0, 4 ) == '0000'
    }

    proof_of_work(last_proof){
        let proof = 0
        while (this.valid_proof(last_proof, proof) == false){
            proof += 1
        }

        return proof
    }
}

// routing instance

const node_identifier = uuid.v4().replace('-', '')
const blockchain = new Blockchain()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/mine', (req, res) => {
    const last_block = blockchain.last_block()
    const last_proof = last_block['proof']
    const proof = blockchain.proof_of_work(last_proof)

    blockchain.new_transaction('0', node_identifier, 1)

    const previous_hash = blockchain.hash(last_block)
    const block = blockchain.new_block(proof, previous_hash)

    const response = {
        'message': 'New Block Forged',
        'index': block['index'],
        'transactions': block['transactions'],
        'proof': block['proof'],
        'previous_hash': block['previous_hash'],
    }

    res.json(response)
})

app.get('/chain', (req, res) => {
    const response = {
        'chain': blockchain.chain,
        'length': blockchain.chain.length,
    }

    res.json(response)
})

app.post('/transactions/new', upload.array(), (req, res) => {
    const values = req.body
    console.log(req.body)

    const required = ['sender', 'recipient', 'amount']

    const index = blockchain.new_transaction(values['sender'], values['recipient'], values['amount'])
    const response = {
        'message': 'Transaction will be added to Block ' + index
    }

    res.send(response)
})


let port = 3333

app.listen(port, ()=> {
    console.log('Server is running')
})
