import React, {Component} from 'react';
import Web3 from 'web3';
import Identicon from 'identicon.js';
import './App.css';
import Decentragram from '../abis/Decentragram.json'
import Navbar from './Navbar'
import Main from './Main'
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({host: 'ipfs.infura.io', port: 5001, protocol: 'https'})
class App extends Component {

    async componentWillMount() {
        await this.loadWeb3();
        await this.loadBlockchainData();
    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.enable()
        } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        } else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    }

    async loadBlockchainData() {
        const accounts = await window.web3.eth.getAccounts()
        this.setState({account: accounts[0]})

        const networkId = await window.web3.eth.net.getId()
        const networkData = Decentragram.networks[networkId]
        if (networkData) {
            const decentragram = window.web3.eth.Contract(Decentragram.abi, networkData.address)
            const imagesCount = await decentragram.methods.imageCount().call()
            const images = [];
            for(let i = 1; i <= imagesCount; i++){
                images.push(await decentragram.methods.images(i).call())
            }
            images.sort((a,b) => b.tipAmount - a.tipAmount)
            this.setState({decentragram, imagesCount, isLoading: false, images})
            console.log(images)
        } else {
            window.alert('Decentragram contract not deployed to detected network')
        }
    }

    captureFile = event => {
        event.preventDefault()
        const file = event.target.files[0]
        const reader = new window.FileReader()
        reader.readAsArrayBuffer(file)


        reader.onloadend = () => {
            this.setState({buffer: Buffer(reader.result)})
        }
    }

    uploadImage = description => {
        ipfs.add(this.state.buffer, (error, result) => {
            if(error){
                console.error(error)
                return
            }

            console.log(result)
            this.setState({
                isLoading: true
            })
            this.state.decentragram.methods.uploadImage(result[0].hash, description).send({from: this.state.account}).on('transactionHash', hash => {
                this.setState({isLoading: false})
            })
        })
    }

    tipImageOwner = (id, tipAmount) => {
     this.setState({isLoading: true})
     this.state.decentragram.methods.tipImageOwner(id).send({from: this.state.account, value: tipAmount}).on('transactionHash', hash => {
         this.setState({isLoading: false})
     })
    }

    constructor(props) {
        super(props)
        this.state = {
            account: '',
            decentragram: null,
            buffer: null,
            images: [],
            imagesCount: 0,
            isLoading: true,
        }
    }

    render() {
        return (
            <div>
                <Navbar account={this.state.account}/>
                {this.state.isLoading
                    ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
                    : <Main
                        captureFile={this.captureFile}
                        uploadImage={this.uploadImage}
                        images={this.state.images}
                        tipImageOwner={this.tipImageOwner}
                    />
                }
            </div>
        );
    }
}

export default App;
