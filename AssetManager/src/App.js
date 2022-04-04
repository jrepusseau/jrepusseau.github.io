import React from 'react'
import { Tab, Tabs, RadioGroup, Radio, FormGroup, InputGroup, NumericInput } from "@blueprintjs/core";
import "../node_modules/@blueprintjs/core/lib/css/blueprint.css";
import "../node_modules/@blueprintjs/icons/lib/css/blueprint-icons.css";
import "../node_modules/normalize.css/normalize.css";
import {
    Address,
    BaseAddress,
    MultiAsset,
    Assets,
    ScriptHash,
    Costmdls,
    Language,
    CostModel,
    AssetName,
    TransactionUnspentOutput,
    TransactionUnspentOutputs,
    TransactionOutput,
    Value,
    TransactionBuilder,
    TransactionBuilderConfigBuilder,
    TransactionOutputBuilder,
    LinearFee,
    BigNum,
    BigInt,
    TransactionHash,
    TransactionInputs,
    TransactionInput,
    TransactionWitnessSet,
    Transaction,
    PlutusData,
    PlutusScripts,
    PlutusScript,
    PlutusList,
    Redeemers,
    Redeemer,
    RedeemerTag,
    Ed25519KeyHashes,
    ConstrPlutusData,
    ExUnits,
    Int,
    NetworkInfo,
    EnterpriseAddress,
    TransactionOutputs,
    hash_transaction,
    hash_script_data,
    hash_plutus_data,
    ScriptDataHash, Ed25519KeyHash, NativeScript, StakeCredential,
    MetadataMap,
    TransactionMetadatum,
    TransactionMetadatumLabels,
        MetadataList,   
    AuxiliaryData,
    GeneralTransactionMetadata
} from "@emurgo/cardano-serialization-lib-asmjs"
import {blake2b} from "blakejs";
let Buffer = require('buffer/').Buffer
let blake = require('blakejs')


export default class App extends React.Component
{
    constructor(props)
    {
        super(props);

        this.state = {
            selectedTabId: "1",
            whichWalletSelected: "ccvault",
            walletFound: false,
            walletIsEnabled: false,
            walletName: undefined,
            walletIcon: undefined,
            walletAPIVersion: undefined,

            networkId: undefined,
            Utxos: undefined,
            CollatUtxos: undefined,
            balance: undefined,
            changeAddress: undefined,
            rewardAddress: undefined,
            usedAddress: undefined,

            txBody: undefined,
            txBodyCborHex_unsigned: "",
            txBodyCborHex_signed: "",
            submittedTxHash: "",

            addressBech32SendADA: "addr1q8vfau3v659vjvf8l77zesetdwetnhvezytplejf3hnkpl7xjjwsdkmauenkmusm73zzr52c3h38shkjaw5g0f5az0eqe5xhjm",
            lovelaceToSend: 3000000,
            assetNameHex: "484f4e474348414c45415645533034323032303232",
            metadataHex: "et2ew34",
            assetPolicyIdHex: "d47473f7409c360c3daa7772c1fd1a2e12b67350b0a6a2d7fe3b2224",
            assetAmountToSend: 10,
            addressScriptBech32: "addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8",
            datumStr: "12345678",
            plutusScriptCborHex: "4e4d01000033222220051200120011",
            transactionIdLocked: "",
            transactionIndxLocked: 0,
            lovelaceLocked: 3000000,
            manualFee: 900000,

        }

        /**
         * When the wallet is connect it returns the connector which is
         * written to this API variable and all the other operations
         * run using this API object
         */
        this.API = undefined;

        /**
         * Protocol parameters
         * @type {{
         * keyDeposit: string,
         * coinsPerUtxoWord: string,
         * minUtxo: string,
         * poolDeposit: string,
         * maxTxSize: number,
         * priceMem: number,
         * maxValSize: number,
         * linearFee: {minFeeB: string, minFeeA: string}, priceStep: number
         * }}
         */
        this.protocolParams = {
            linearFee: {
                minFeeA: "44",
                minFeeB: "155381",
            },
            minUtxo: "34482",
            poolDeposit: "500000000",
            keyDeposit: "2000000",
            maxValSize: 5000,
            maxTxSize: 16384,
            priceMem: 0.0577,
            priceStep: 0.0000721,
            coinsPerUtxoWord: "34482",
        }


    }

    /**
     * Handles the tab selection on the user form
     * @param tabId
     */
    handleTabId = (tabId) => this.setState({selectedTabId: tabId})

    /**
     * Handles the radio buttons on the form that
     * let the user choose which wallet to work with
     * @param obj
     */
    handleWalletSelect = (obj) => {
        const whichWalletSelected = obj.target.value
        this.setState({whichWalletSelected},
            () => {
                this.refreshData()
            })
    }

    /**
     * Generate address from the plutus contract cborhex
     */
    generateScriptAddress = () => {
        // cborhex of the alwayssucceeds.plutus
        // const cborhex = "4e4d01000033222220051200120011";
        // const cbor = Buffer.from(cborhex, "hex");
        // const blake2bhash = blake.blake2b(cbor, 0, 28);

        const script = PlutusScript.from_bytes(Buffer.from(this.state.plutusScriptCborHex, "hex"))
        // const blake2bhash = blake.blake2b(script.to_bytes(), 0, 28);
        const blake2bhash = "67f33146617a5e61936081db3b2117cbf59bd2123748f58ac9678656";
        const scripthash = ScriptHash.from_bytes(Buffer.from(blake2bhash,"hex"));

        const cred = StakeCredential.from_scripthash(scripthash);
        const networkId = NetworkInfo.testnet().network_id();
        const baseAddr = EnterpriseAddress.new(networkId, cred);
        const addr = baseAddr.to_address();
        const addrBech32 = addr.to_bech32();

        // hash of the address generated from script
        console.log(Buffer.from(addr.to_bytes(), "utf8").toString("hex"))

        // hash of the address generated using cardano-cli
        const ScriptAddress = Address.from_bech32("addr_test1wpnlxv2xv9a9ucvnvzqakwepzl9ltx7jzgm53av2e9ncv4sysemm8");
        console.log(Buffer.from(ScriptAddress.to_bytes(), "utf8").toString("hex"))


        console.log(ScriptAddress.to_bech32())
        console.log(addrBech32)

    }

    /**
     * Checks if the wallet is running in the browser
     * Does this for Nami, CCvault and Flint wallets
     * @returns {boolean}
     */

    checkIfWalletFound = () => {
        let walletFound = false;

        const wallet = this.state.whichWalletSelected;
        if (wallet === "nami") {
            walletFound = !!window?.cardano?.nami
        } else if (wallet === "ccvault") {
            walletFound = !!window?.cardano?.ccvault
        } else if (wallet === "flint") {
            walletFound = !!window?.cardano?.flint
        }

        this.setState({walletFound})
        return walletFound;
    }

    /**
     * Checks if a connection has been established with
     * the wallet
     * @returns {Promise<boolean>}
     */
    checkIfWalletEnabled = async () => {

        let walletIsEnabled = false;

        try {
            const wallet = this.state.whichWalletSelected;
            if (wallet === "nami") {
                walletIsEnabled = await window.cardano.nami.isEnabled();
            } else if (wallet === "ccvault") {
                walletIsEnabled = await window.cardano.ccvault.isEnabled();
            } else if (wallet === "flint") {
                walletIsEnabled = await window.cardano.flint.isEnabled();
            }

            this.setState({walletIsEnabled})

        } catch (err) {
            console.log(err)
        }

        return walletIsEnabled
    }

    /**
     * Enables the wallet that was chosen by the user
     * When this executes the user should get a window pop-up
     * from the wallet asking to approve the connection
     * of this app to the wallet
     * @returns {Promise<void>}
     */

    enableWallet = async () => {
        try {

            const wallet = this.state.whichWalletSelected;
            if (wallet === "nami") {
                this.API = await window.cardano.nami.enable();
            } else if (wallet === "ccvault") {
                this.API = await window.cardano.ccvault.enable();
            } else if (wallet === "flint") {
                this.API = await window.cardano.flint.enable();
            }

            await this.checkIfWalletEnabled();
            await this.getNetworkId();

        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Get the API version used by the wallets
     * writes the value to state
     * @returns {*}
     */
    getAPIVersion = () => {

        let walletAPIVersion;

        const wallet = this.state.whichWalletSelected;
        if (wallet === "nami") {
            walletAPIVersion = window?.cardano?.nami.apiVersion
        } else if (wallet === "ccvault") {
            walletAPIVersion = window?.cardano?.ccvault.apiVersion;
        } else if (wallet === "flint") {
            walletAPIVersion = window?.cardano?.flint.apiVersion;
        }

        this.setState({walletAPIVersion})
        return walletAPIVersion;
    }

    /**
     * Get the name of the wallet (nami, ccvault, flint)
     * and store the name in the state
     * @returns {*}
     */

    getWalletName = () => {

        let walletName;

        const wallet = this.state.whichWalletSelected;
        if (wallet === "nami") {
            walletName = window?.cardano?.nami.name
        } else if (wallet === "ccvault") {
            walletName = window?.cardano?.ccvault.name
        } else if (wallet === "flint") {
            walletName = window?.cardano?.flint.name
        }

        this.setState({walletName})
        return walletName;
    }

    /**
     * Gets the Network ID to which the wallet is connected
     * 0 = testnet
     * 1 = mainnet
     * Then writes either 0 or 1 to state
     * @returns {Promise<void>}
     */
    getNetworkId = async () => {
        try {
            const networkId = await this.API.getNetworkId();
            this.setState({networkId})

        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Gets the UTXOs from the user's wallet and then
     * stores in an object in the state
     * @returns {Promise<void>}
     */

    getUtxos = async () => {

        let Utxos = [];

        try {
            const rawUtxos = await this.API.getUtxos();

            for (const rawUtxo of rawUtxos) {
                const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(rawUtxo, "hex"));
                const input = utxo.input();
                const txid = Buffer.from(input.transaction_id().to_bytes(), "utf8").toString("hex");
                const txindx = input.index();
                const output = utxo.output();
                const amount = output.amount().coin().to_str(); // ADA amount in lovelace
                const multiasset = output.amount().multiasset();
                let multiAssetStr = "";

                if (multiasset) {
                    const keys = multiasset.keys() // policy Ids of thee multiasset
                    const N = keys.len();
                    // console.log(`${N} Multiassets in the UTXO`)


                    for (let i = 0; i < N; i++){
                        const policyId = keys.get(i);
                        const policyIdHex = Buffer.from(policyId.to_bytes(), "utf8").toString("hex");
                        // console.log(`policyId: ${policyIdHex}`)
                        const assets = multiasset.get(policyId)
                        const assetNames = assets.keys();
                        const K = assetNames.len()
                        // console.log(`${K} Assets in the Multiasset`)

                        for (let j = 0; j < K; j++) {
                            const assetName = assetNames.get(j);
                            const assetNameString = Buffer.from(assetName.name(),"utf8").toString();
                            const assetNameHex = Buffer.from(assetName.name(),"utf8").toString("hex")
                            const multiassetAmt = multiasset.get_asset(policyId, assetName)
                            multiAssetStr += `+ ${multiassetAmt.to_str()} + ${policyIdHex}.${assetNameHex} (${assetNameString})`
                            // console.log(assetNameString)
                            // console.log(`Asset Name: ${assetNameHex}`)
                        }
                    }
                }


                const obj = {
                    txid: txid,
                    txindx: txindx,
                    amount: amount,
                    str: `${txid} #${txindx} = ${amount}`,
                    multiAssetStr: multiAssetStr,
                    TransactionUnspentOutput: utxo
                }
                Utxos.push(obj);
                // console.log(`utxo: ${str}`)
            }
            this.setState({Utxos})
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * The collateral is need for working with Plutus Scripts
     * Essentially you need to provide collateral to pay for fees if the
     * script execution fails after the script has been validated...
     * this should be an uncommon occurrence and would suggest the smart contract
     * would have been incorrectly written.
     * The amount of collateral to use is set in the wallet
     * @returns {Promise<void>}
     */
    getCollateral = async () => {

        let CollatUtxos = [];

        try {

            let collateral = [];

            const wallet = this.state.whichWalletSelected;
            if (wallet === "nami") {
                collateral = await this.API.experimental.getCollateral();
            } else {
                collateral = await this.API.getCollateral();
            }

            for (const x of collateral) {
                const utxo = TransactionUnspentOutput.from_bytes(Buffer.from(x, "hex"));
                CollatUtxos.push(utxo)
                // console.log(utxo)
            }
            this.setState({CollatUtxos})
        } catch (err) {
            console.log(err)
        }

    }

    /**
     * Gets the current balance of in Lovelace in the user's wallet
     * This doesnt resturn the amounts of all other Tokens
     * For other tokens you need to look into the full UTXO list
     * @returns {Promise<void>}
     */
    getBalance = async () => {
        try {
            const balanceCBORHex = await this.API.getBalance();

            const balance = Value.from_bytes(Buffer.from(balanceCBORHex, "hex")).coin().to_str();
            this.setState({balance})

        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Get the address from the wallet into which any spare UTXO should be sent
     * as change when building transactions.
     * @returns {Promise<void>}
     */
    getChangeAddress = async () => {
        try {
            const raw = await this.API.getChangeAddress();
            const changeAddress = Address.from_bytes(Buffer.from(raw, "hex")).to_bech32()
            this.setState({changeAddress})
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * This is the Staking address into which rewards from staking get paid into
     * @returns {Promise<void>}
     */
    getRewardAddresses = async () => {

        try {
            const raw = await this.API.getRewardAddresses();
            const rawFirst = raw[0];
            const rewardAddress = Address.from_bytes(Buffer.from(rawFirst, "hex")).to_bech32()
            // console.log(rewardAddress)
            this.setState({rewardAddress})

        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Gets previsouly used addresses
     * @returns {Promise<void>}
     */
    getUsedAddresses = async () => {

        try {
            const raw = await this.API.getUsedAddresses();
            const rawFirst = raw[0];
            const usedAddress = Address.from_bytes(Buffer.from(rawFirst, "hex")).to_bech32()
            // console.log(rewardAddress)
            this.setState({usedAddress})

        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Refresh all the data from the user's wallet
     * @returns {Promise<void>}
     */
    refreshData = async () => {

        this.generateScriptAddress()

        try{
            const walletFound = this.checkIfWalletFound();
            if (walletFound) {
                await this.enableWallet();
                await this.getAPIVersion();
                await this.getWalletName();
                await this.getUtxos();
                await this.getCollateral();
                await this.getBalance();
                await this.getChangeAddress();
                await this.getRewardAddresses();
                await this.getUsedAddresses();
            }
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Every transaction starts with initializing the
     * TransactionBuilder and setting the protocol parameters
     * This is boilerplate
     * @returns {Promise<TransactionBuilder>}
     */
    initTransactionBuilder = async () => {

        const txBuilder = TransactionBuilder.new(
            TransactionBuilderConfigBuilder.new()
                .fee_algo(LinearFee.new(BigNum.from_str(this.protocolParams.linearFee.minFeeA), BigNum.from_str(this.protocolParams.linearFee.minFeeB)))
                .pool_deposit(BigNum.from_str(this.protocolParams.poolDeposit))
                .key_deposit(BigNum.from_str(this.protocolParams.keyDeposit))
                .coins_per_utxo_word(BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
                .max_value_size(this.protocolParams.maxValSize)
                .max_tx_size(this.protocolParams.maxTxSize)
                .prefer_pure_change(true)
                .build()
        );

        return txBuilder
    }

    /**
     * Builds an object with all the UTXOs from the user's wallet
     * @returns {Promise<TransactionUnspentOutputs>}
     */
    getTxUnspentOutputs = async () => {
        let txOutputs = TransactionUnspentOutputs.new()
        for (const utxo of this.state.Utxos) {
            txOutputs.add(utxo.TransactionUnspentOutput)
        }
        return txOutputs
    }

    /**
     * The transaction is build in 3 stages:
     * 1 - initialize the Transaction Builder
     * 2 - Add inputs and outputs
     * 3 - Calculate the fee and how much change needs to be given
     * 4 - Build the transaction body
     * 5 - Sign it (at this point the user will be prompted for
     * a password in his wallet)
     * 6 - Send the transaction
     * @returns {Promise<void>}
     */
    buildSendADATransaction = async () => {

        const txBuilder = await this.initTransactionBuilder();
        const shelleyOutputAddress = Address.from_bech32(this.state.addressBech32SendADA);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);

        txBuilder.add_output(
            TransactionOutput.new(
                shelleyOutputAddress,
                Value.new(BigNum.from_str(this.state.lovelaceToSend.toString()))
            ),
        );

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 1)

        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();


        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
        )

        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);

        console.log(txVkeyWitnesses)

        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet
        );


        const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log(submittedTxHash)
        this.setState({submittedTxHash});


    }


    buildSendTokenTransaction = async () => {

        let utf8Encode = new TextEncoder();
        utf8Encode.encode("abc");

        const map = MetadataMap.new();
        map.insert(
            TransactionMetadatum.new_text("receiver_id"),
            TransactionMetadatum.new_text("jkfdsufjdk34h3Sdfjdhfduf873"),
        );
             map.insert(
           TransactionMetadatum.new_text("sender_id"),
           TransactionMetadatum.new_text("jkfdsufjdk34h3Sdfjdhfduf873"),
        );
        map.insert(
           TransactionMetadatum.new_text("comment"),
           TransactionMetadatum.new_text("happy birthday"),
        ); 
        
        /*const tags =  MetadataList.new();
        tags.add( TransactionMetadatum.new_int( Int.new( BigNum.from_str("0"))));
        tags.add( TransactionMetadatum.new_int( Int.new( BigNum.from_str("264"))));
        tags.add( TransactionMetadatum.new_int( Int.new_negative( BigNum.from_str("1024"))));
        tags.add( TransactionMetadatum.new_int( Int.new( BigNum.from_str("32"))));
        map.insert(
           TransactionMetadatum.new_text("tags"),
           TransactionMetadatum.new_list(tags),
        ); */
        const metadatum = TransactionMetadatum.new_map(map);
        
       const metadatum2 = GeneralTransactionMetadata.new()
       metadatum2.insert(
            BigNum.from_str("264"),
           TransactionMetadatum.new_text("https://github.com/Emurgo/ 304adec86c7764e6540aa64f02a6af02")

            );

        //TransactionMetadatum.new_map(map);

        const txBuilder = await this.initTransactionBuilder();
        const shelleyOutputAddress = Address.from_bech32(this.state.addressBech32SendADA);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress);

        let txOutputBuilder = TransactionOutputBuilder.new();
        txOutputBuilder = txOutputBuilder.with_address(shelleyOutputAddress);
        txOutputBuilder = txOutputBuilder.next();

        let multiAsset = MultiAsset.new();
        let assets = Assets.new()
        assets.insert(
            AssetName.new(Buffer.from(this.state.assetNameHex, "hex")), // Asset Name
            BigNum.from_str(this.state.assetAmountToSend.toString()) // How much to send
        );
        multiAsset.insert(
            ScriptHash.from_bytes(Buffer.from(this.state.assetPolicyIdHex, "hex")), // PolicyID
            assets
        );

        txOutputBuilder = txOutputBuilder.with_asset_and_min_required_coin(multiAsset, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))
        const txOutput = txOutputBuilder.build();

        txBuilder.add_output(txOutput)

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 3)


        // set the time to live - the absolute slot value before the tx becomes invalid
        // txBuilder.set_ttl(51821456);

        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();

        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
            AuxiliaryData.from_bytes(metadatum2.to_bytes())
                
            
        );

        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet
        );

        const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log(submittedTxHash)
        this.setState({submittedTxHash});

        // const txBodyCborHex_unsigned = Buffer.from(txBody.to_bytes(), "utf8").toString("hex");
        // this.setState({txBodyCborHex_unsigned, txBody})

    }



    buildSendAdaToPlutusScript = async () => {

        const txBuilder = await this.initTransactionBuilder();
        const ScriptAddress = Address.from_bech32(this.state.addressScriptBech32);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)


        let txOutputBuilder = TransactionOutputBuilder.new();
        txOutputBuilder = txOutputBuilder.with_address(ScriptAddress);
        const dataHash = hash_plutus_data(PlutusData.new_integer(BigInt.from_str(this.state.datumStr)))
        txOutputBuilder = txOutputBuilder.with_data_hash(dataHash)

        txOutputBuilder = txOutputBuilder.next();

        txOutputBuilder = txOutputBuilder.with_value(Value.new(BigNum.from_str(this.state.lovelaceToSend.toString())))
        const txOutput = txOutputBuilder.build();

        txBuilder.add_output(txOutput)

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 2)


        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();

        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
        )

        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet
        );

        const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log(submittedTxHash)
        this.setState({submittedTxHash: submittedTxHash, transactionIdLocked: submittedTxHash, lovelaceLocked: this.state.lovelaceToSend});


    }

    buildSendTokenToPlutusScript = async () => {

        const txBuilder = await this.initTransactionBuilder();
        const ScriptAddress = Address.from_bech32(this.state.addressScriptBech32);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)

        let txOutputBuilder = TransactionOutputBuilder.new();
        txOutputBuilder = txOutputBuilder.with_address(ScriptAddress);
        const dataHash = hash_plutus_data(PlutusData.new_integer(BigInt.from_str(this.state.datumStr)))
        txOutputBuilder = txOutputBuilder.with_data_hash(dataHash)

        txOutputBuilder = txOutputBuilder.next();




        let multiAsset = MultiAsset.new();
        let assets = Assets.new()
        assets.insert(
            AssetName.new(Buffer.from(this.state.assetNameHex, "hex")), // Asset Name
            BigNum.from_str(this.state.assetAmountToSend.toString()) // How much to send
        );
        multiAsset.insert(
            ScriptHash.from_bytes(Buffer.from(this.state.assetPolicyIdHex, "hex")), // PolicyID
            assets
        );

        // txOutputBuilder = txOutputBuilder.with_asset_and_min_required_coin(multiAsset, BigNum.from_str(this.protocolParams.coinsPerUtxoWord))

        txOutputBuilder = txOutputBuilder.with_coin_and_asset(BigNum.from_str(this.state.lovelaceToSend.toString()),multiAsset)

        const txOutput = txOutputBuilder.build();

        txBuilder.add_output(txOutput)

        // Find the available UTXOs in the wallet and
        // us them as Inputs
        const txUnspentOutputs = await this.getTxUnspentOutputs();
        txBuilder.add_inputs_from(txUnspentOutputs, 3)





        // calculate the min fee required and send any change to an address
        txBuilder.add_change_if_needed(shelleyChangeAddress)

        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();

        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
        )

        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet
        );

        const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log(submittedTxHash)
        this.setState({submittedTxHash: submittedTxHash, transactionIdLocked: submittedTxHash, lovelaceLocked: this.state.lovelaceToSend})

    }




    buildRedeemAdaFromPlutusScript = async () => {

        const txBuilder = await this.initTransactionBuilder();
        const ScriptAddress = Address.from_bech32(this.state.addressScriptBech32);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)

        txBuilder.add_input(
            ScriptAddress,
            TransactionInput.new(
                TransactionHash.from_bytes(Buffer.from(this.state.transactionIdLocked, "hex")),
                this.state.transactionIndxLocked.toString()),
            Value.new(BigNum.from_str(this.state.lovelaceLocked.toString()))) // how much lovelace is at that UTXO

        txBuilder.set_fee(BigNum.from_str(Number(this.state.manualFee).toString()))

        const scripts = PlutusScripts.new();
        scripts.add(PlutusScript.from_bytes(Buffer.from(this.state.plutusScriptCborHex, "hex"))); //from cbor of plutus script

        // Add outputs
        const outputVal = this.state.lovelaceLocked.toString() - Number(this.state.manualFee)
        const outputValStr = outputVal.toString();
        txBuilder.add_output(TransactionOutput.new(shelleyChangeAddress, Value.new(BigNum.from_str(outputValStr))))


        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();

        const collateral = this.state.CollatUtxos;
        const inputs = TransactionInputs.new();
        collateral.forEach((utxo) => {
            inputs.add(utxo.input());
        });

        let datums = PlutusList.new();
        // datums.add(PlutusData.from_bytes(Buffer.from(this.state.datumStr, "utf8")))
        datums.add(PlutusData.new_integer(BigInt.from_str(this.state.datumStr)))

        const redeemers = Redeemers.new();

        const data = PlutusData.new_constr_plutus_data(
            ConstrPlutusData.new(
                BigNum.from_str("0"),
                PlutusList.new()
            )
        );

        const redeemer = Redeemer.new(
            RedeemerTag.new_spend(),
            BigNum.from_str("0"),
            data,
            ExUnits.new(
                BigNum.from_str("7000000"),
                BigNum.from_str("3000000000")
            )
        );

        redeemers.add(redeemer)

        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        transactionWitnessSet.set_plutus_scripts(scripts)
        transactionWitnessSet.set_plutus_data(datums)
        transactionWitnessSet.set_redeemers(redeemers)

        const cost_model_vals = [197209, 0, 1, 1, 396231, 621, 0, 1, 150000, 1000, 0, 1, 150000, 32, 2477736, 29175, 4, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 100, 100, 29773, 100, 150000, 32, 150000, 32, 150000, 32, 150000, 1000, 0, 1, 150000, 32, 150000, 1000, 0, 8, 148000, 425507, 118, 0, 1, 1, 150000, 1000, 0, 8, 150000, 112536, 247, 1, 150000, 10000, 1, 136542, 1326, 1, 1000, 150000, 1000, 1, 150000, 32, 150000, 32, 150000, 32, 1, 1, 150000, 1, 150000, 4, 103599, 248, 1, 103599, 248, 1, 145276, 1366, 1, 179690, 497, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 148000, 425507, 118, 0, 1, 1, 61516, 11218, 0, 1, 150000, 32, 148000, 425507, 118, 0, 1, 1, 148000, 425507, 118, 0, 1, 1, 2477736, 29175, 4, 0, 82363, 4, 150000, 5000, 0, 1, 150000, 32, 197209, 0, 1, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 3345831, 1, 1];

        const costModel = CostModel.new();
        cost_model_vals.forEach((x, i) => costModel.set(i, Int.new_i32(x)));


        const costModels = Costmdls.new();
        costModels.insert(Language.new_plutus_v1(), costModel);

        const scriptDataHash = hash_script_data(redeemers, costModels, datums);
        txBody.set_script_data_hash(scriptDataHash);

        txBody.set_collateral(inputs)


        const baseAddress = BaseAddress.from_address(shelleyChangeAddress)
        const requiredSigners = Ed25519KeyHashes.new();
        requiredSigners.add(baseAddress.payment_cred().to_keyhash())

        txBody.set_required_signers(requiredSigners);

        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
        )

        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet
        );

        const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log(submittedTxHash)
        this.setState({submittedTxHash});

    }

    buildRedeemTokenFromPlutusScript = async () => {

        const txBuilder = await this.initTransactionBuilder();
        const ScriptAddress = Address.from_bech32(this.state.addressScriptBech32);
        const shelleyChangeAddress = Address.from_bech32(this.state.changeAddress)

        let multiAsset = MultiAsset.new();
        let assets = Assets.new()
        assets.insert(
            AssetName.new(Buffer.from(this.state.assetNameHex, "hex")), // Asset Name
            BigNum.from_str(this.state.assetAmountToSend.toString()) // How much to send
        );

        multiAsset.insert(
            ScriptHash.from_bytes(Buffer.from(this.state.assetPolicyIdHex, "hex")), // PolicyID
            assets
        );

        txBuilder.add_input(
            ScriptAddress,
            TransactionInput.new(
                TransactionHash.from_bytes(Buffer.from(this.state.transactionIdLocked, "hex")),
                this.state.transactionIndxLocked.toString()),
            Value.new_from_assets(multiAsset)
        ) // how much lovelace is at that UTXO


        txBuilder.set_fee(BigNum.from_str(Number(this.state.manualFee).toString()))

        const scripts = PlutusScripts.new();
        scripts.add(PlutusScript.from_bytes(Buffer.from(this.state.plutusScriptCborHex, "hex"))); //from cbor of plutus script


        // Add outputs
        const outputVal = this.state.lovelaceLocked.toString() - Number(this.state.manualFee)
        const outputValStr = outputVal.toString();

        let txOutputBuilder = TransactionOutputBuilder.new();
        txOutputBuilder = txOutputBuilder.with_address(shelleyChangeAddress);
        txOutputBuilder = txOutputBuilder.next();
        txOutputBuilder = txOutputBuilder.with_coin_and_asset(BigNum.from_str(outputValStr),multiAsset)

        const txOutput = txOutputBuilder.build();
        txBuilder.add_output(txOutput)


        // once the transaction is ready, we build it to get the tx body without witnesses
        const txBody = txBuilder.build();

        const collateral = this.state.CollatUtxos;
        const inputs = TransactionInputs.new();
        collateral.forEach((utxo) => {
            inputs.add(utxo.input());
        });



        let datums = PlutusList.new();
        // datums.add(PlutusData.from_bytes(Buffer.from(this.state.datumStr, "utf8")))
        datums.add(PlutusData.new_integer(BigInt.from_str(this.state.datumStr)))

        const redeemers = Redeemers.new();

        const data = PlutusData.new_constr_plutus_data(
            ConstrPlutusData.new(
                BigNum.from_str("0"),
                PlutusList.new()
            )
        );

        const redeemer = Redeemer.new(
            RedeemerTag.new_spend(),
            BigNum.from_str("0"),
            data,
            ExUnits.new(
                BigNum.from_str("7000000"),
                BigNum.from_str("3000000000")
            )
        );

        redeemers.add(redeemer)

        // Tx witness
        const transactionWitnessSet = TransactionWitnessSet.new();

        transactionWitnessSet.set_plutus_scripts(scripts)
        transactionWitnessSet.set_plutus_data(datums)
        transactionWitnessSet.set_redeemers(redeemers)

        const cost_model_vals = [197209, 0, 1, 1, 396231, 621, 0, 1, 150000, 1000, 0, 1, 150000, 32, 2477736, 29175, 4, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 29773, 100, 100, 100, 29773, 100, 150000, 32, 150000, 32, 150000, 32, 150000, 1000, 0, 1, 150000, 32, 150000, 1000, 0, 8, 148000, 425507, 118, 0, 1, 1, 150000, 1000, 0, 8, 150000, 112536, 247, 1, 150000, 10000, 1, 136542, 1326, 1, 1000, 150000, 1000, 1, 150000, 32, 150000, 32, 150000, 32, 1, 1, 150000, 1, 150000, 4, 103599, 248, 1, 103599, 248, 1, 145276, 1366, 1, 179690, 497, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 148000, 425507, 118, 0, 1, 1, 61516, 11218, 0, 1, 150000, 32, 148000, 425507, 118, 0, 1, 1, 148000, 425507, 118, 0, 1, 1, 2477736, 29175, 4, 0, 82363, 4, 150000, 5000, 0, 1, 150000, 32, 197209, 0, 1, 1, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 150000, 32, 3345831, 1, 1];

        const costModel = CostModel.new();
        cost_model_vals.forEach((x, i) => costModel.set(i, Int.new_i32(x)));


        const costModels = Costmdls.new();
        costModels.insert(Language.new_plutus_v1(), costModel);

        const scriptDataHash = hash_script_data(redeemers, costModels, datums);
        txBody.set_script_data_hash(scriptDataHash);

        txBody.set_collateral(inputs)


        const baseAddress = BaseAddress.from_address(shelleyChangeAddress)
        const requiredSigners = Ed25519KeyHashes.new();
        requiredSigners.add(baseAddress.payment_cred().to_keyhash())

        txBody.set_required_signers(requiredSigners);

        const tx = Transaction.new(
            txBody,
            TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes())
        )

        let txVkeyWitnesses = await this.API.signTx(Buffer.from(tx.to_bytes(), "utf8").toString("hex"), true);
        txVkeyWitnesses = TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, "hex"));

        transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());

        const signedTx = Transaction.new(
            tx.body(),
            transactionWitnessSet
        );

        const submittedTxHash = await this.API.submitTx(Buffer.from(signedTx.to_bytes(), "utf8").toString("hex"));
        console.log(submittedTxHash)
        this.setState({submittedTxHash});

    }


    async componentDidMount() {
        await this.refreshData();
    }

    

retrieveData (ele)
{
    var xtp = new XMLHttpRequest();
    //Search for the fungible token with the fungible token id write on the search box and send the request to blockfrost
    //Here we request the  transaction of an asset by using https://cardano-mainnet.blockfrost.io/api/v0/assets/{asset}/txs 
      xtp.open( "GET",'https://cardano-mainnet.blockfrost.io/api/v0/assets/'+ele+'/txs', false ); // false for synchronous request
      //Use the API account created on the header 
    xtp.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
      xtp.send( null );
  //Then we retrieve the API response 
      var contentt = JSON.parse(xtp.responseText)
      
      //The first answer correspond to the token miniting phase (creation) ,
      
    var xtx = new XMLHttpRequest();
      xtx.open( "GET",'https://cardano-mainnet.blockfrost.io/api/v0/txs/'+contentt[0]+'/metadata', false ); // false for synchronous request
    xtx.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
      xtx.send( null );
    
    //The format of the parsing data are not correct then we parse it one the first line 
    var x;
        var contentb = JSON.parse(xtx.responseText);
        console.log(xtx.responseText);
     //   alert(xtx.responseText);
     var t=(contentb[0].json_metadata);
  
    for (var key in t) {
     var value = t[key];
       for (var n in value)
         {
       x = value[n];
         
          }
  }
  return x;   
}


returnTxAsset (assetidt)
{
  var xtp = new XMLHttpRequest();

    xtp.open( "GET",'https://cardano-mainnet.blockfrost.io/api/v0/assets/'+assetidt+'/txs', false ); // false for synchronous request
    //Use the API account created on the header 
  xtp.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
    xtp.send( null );
//Then we retrieve the API response 
    return JSON.parse(xtp.responseText);
}

 returnAddress(stkad)
{
   var AddressArray =[]; 
   var xhpd= new XMLHttpRequest();
      xhpd.open( "GET",'https://cardano-mainnet.blockfrost.io/api/v0/accounts/'+stkad+'/addresses',false); // false for synchronous request
    xhpd.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
      xhpd.send( null );
        var dataIO = JSON.parse(xhpd.responseText)
       dataIO.forEach(add=>{
          AddressArray.push(add.address)
          })
  return AddressArray; 
        }

returnStake(ad)
{
  
   var xhpd= new XMLHttpRequest();
    xhpd.open( "GET",'https://cardano-mainnet.blockfrost.io/api/v0/addresses/'+ad, false ); // false for synchronous request
  xhpd.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
    xhpd.send( null );
      var dataIO = JSON.parse(xhpd.responseText)
     var stake = dataIO.stake_address;
    return stake;
  
}


returnDateTx (d1)
{
   
    const unixTime = d1.block_time;
    return  new Date(unixTime*1000);

}

returnIO(hash)
{
  
   var xhpd= new XMLHttpRequest();
    xhpd.open( "GET",'https://cardano-mainnet.blockfrost.io/api/v0/txs/'+hash+'/utxos', false ); // false for synchronous request
  xhpd.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
    xhpd.send( null );
      var dataIO = JSON.parse(xhpd.responseText)
     

    var input = dataIO.inputs[0].address; 
    var output = dataIO.outputs[0].address;  

 /* var amount1u =dataIO.inputs[0].amount[0].unit;
      var amount1q= dataIO.inputs[0].amount[0].quantity;
     try{
        var amount2u =dataIO.inputs[0].amount[1].unit;
      var amount2q=  dataIO.inputs[0].amount[1].quantity;
      }
       catch
       {  
          var amount2u ="";
               var amount2q ="";
           
         }
       
   return [input, output,amount1u,amount1q, amount2u,amount2q]; Data sturcture not ready */ 

   return [input, output, xhpd.responseText]
  
}

returnTxAddress(addressid)
{
    var xtp = new XMLHttpRequest();

    xtp.open( "GET",'https://cardano-mainnet.blockfrost.io/api/v0/addresses/'+addressid+'/txs', false ); // false for synchronous request
    //Use the API account created on the header 
  xtp.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
    xtp.send( null );
//Then we retrieve the API response 
    return JSON.parse(xtp.responseText);

}


returnTxDetails (tx)
{
var xtprd= new XMLHttpRequest();
xtprd.open( "GET",'https://cardano-mainnet.blockfrost.io/api/v0/txs/'+tx, false ); // false for synchronous request
xtprd.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
xtprd.send( null );
return JSON.parse(xtprd.responseText)
}

returnTxMetadata(tx)
{
var xtpr = new XMLHttpRequest(); // Transaction 1 
    xtpr.open( "GET",'https://cardano-mainnet.blockfrost.io/api/v0/txs/'+tx+'/metadata', false ); // false for synchronous request
  xtpr.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
    xtpr.send( null )
return (xtpr.responseText)
  //return JSON.parse((xtpr.responseText).replace('[','').replace(']','').replace('[','').replace(']',''));
}

returmJSON(url)
{

    var xtpr = new XMLHttpRequest(); // Transaction 1 
    xtpr.open( "GET",url, false ); // false for synchronous request
 // xtpr.setRequestHeader("project_id", 'mainnetfXjRIYdCo4FNIxJ15AgCSxLxjLLxZPag');
    xtpr.send( null )
return (xtpr.responseText)


}

addressMatch(adr)
{
    let test = adr;
    var arr = { "stake1uxh66rrhqw6xnmgzzwecfay88qj82dldkqnxzv24vsd2jlcntzenm":"@Farmer", "stake1uxkfxnq76mdljmpjsca8uf4cvys263vxnjdgrgecyl0r85cphcncy": "@Fund", "stake1u8rff8gxmd77vemd7gdlg3pp69vgmcnctmfwh2y856w38ushuc9q3": "@Manufacturer" }; 
    /*for (let value of Object.keys(arr)) {
     if (adr == value)
       test = Object.values(arr); 
    }
    return test;*/
    for (let i = 0; i < Object.keys(arr).length; i++) {
         if (adr == Object.keys(arr)[i])
        test = Object.values(arr)[i]; 
    }
    return test; 
}



  testAlert = async () => 
  {

  var arr1 = this.state.Utxos[1].multiAssetStr.split("+");
 var ap= [];
 var ar = arr1.filter(function(v, i) {
    // filter even number
    return i % 2 == 0;
  });
  var qt = arr1.filter(function(v, i) {
    // filter even number
    return (i+1) % 2 == 0;
  });
  alert(qt);
  ar.shift();
  ar.forEach(element => {
     var b =[]
    b= element.split(" ")
   var b1= b[1].split('.')
   // if (b1[0]=="47821765f6f7c97c6db9b16d4a7cf33d52738a3a66dbad87f398169b") check if a policy id is in the wallet 
   // alert('Find');
    ap.push(b1.join(""));
 }
 )

  //alert (ar.length)
  //alert( ap[0] + ap[1] + ap[2] + ap[3] + ap[4] + ap[5] );

 /*
let objt2=x;
let items2 = Object.keys(objt2).map((key) => [String(key) , objt2[key]]); */ 

let  listContainerCert = document.createElement('div'),
listRawCert= document.createElement('row'),
listContainerProd =  document.createElement('div'),
listRawProd= document.createElement('row'),
  j; 
  // Add it to the page
  document.getElementById('certificationSpace').appendChild(listContainerCert);
  listContainerCert.appendChild(listRawCert);
  listRawCert.style.display = "flex";

  document.getElementById('prodSpace').appendChild(listContainerProd);
  listContainerProd.appendChild(listRawProd);
  listRawProd.style.display = "flex";



for (j = 0; j < ap.length; ++j) 
{
     var x = this.retrieveData(ap[j]);
     var listCol= document.createElement('column');
     listCol.style.flex = "20%";
     //var listElement2 = document.createElement('div');
  
 try{ var ipfs = x.image.split("//");  
  var img = document.createElement('img');
  
        img.src = 'https://ipfs.io/ipfs/'+ipfs[1];
       // img.style.width = '156px';
//img.style.height = 'auto'; 
listCol.appendChild(img);
}
    catch{}
var info = document.createElement('p');
  info.innerHTML=x.name + "</br> quantity:" + qt[j] ;
        
       listCol.appendChild(info);
        
      // create an item for each one;
      if (qt[j]==1)
      listRawCert.appendChild(listCol);
      else
      listRawProd.appendChild(listCol);
}

      


    const txBoard = document.getElementById("txBoard");

    const tableHeaders = ["From" , "To", "Tx", "Time ", "Metadata", "Details"];

    
        while (txBoard.firstChild) txBoard.removeChild(txBoard.firstChild)

        let txBoardTable = document.createElement("table");
       txBoardTable.id= "txBoardTable";
        let txBoardTableHead = document.createElement("thead");
        let txBoardTableHeaderRow = document.createElement("tr");

        tableHeaders.forEach(header=>{
        let scoreHeader = document.createElement('th');
        scoreHeader.innerText= header; 
        txBoardTableHeaderRow.append(scoreHeader);
        })

        txBoardTableHead.append(txBoardTableHeaderRow);
        txBoardTable.append(txBoardTableHead);

        let txTableBody = document.createElement("tbody");
      txBoardTable.append(txTableBody);

      txBoard.append(txBoardTable);

  
 const listAddress = this.returnAddress(this.state.rewardAddress.toString()); //Take the list of transaction on the account

 /* listAddress.forEach(add  => {

         let listTx =[]
    
       let listTxAd= this.returnTxAddress(add)
        listTxAd.forEach(ct => {
          listTx.push(this.returnTxDetails(ct))
        }) */

        let listTx =[]
    
       let listTxAd= this.returnTxAsset(ap[5]);
       listTxAd.forEach(ct => {
         listTx.push(this.returnTxDetails(ct))
       }) 

        listTx.forEach((tx,index) => {
 try{
      let txBoardBodyRaw = document.createElement('tr'); 
      let infoTx = this.returnIO(listTxAd[index]);
      let FromAddress = document.createElement('td')
       FromAddress.innerText = this.addressMatch(this.returnStake(infoTx[0])) ;
       let ToAddress = document.createElement('td')
       ToAddress.innerText = this.addressMatch(this.returnStake(infoTx[1])) ; 
       let Trax = document.createElement('td')
       let a = document.createElement("a")
       a.innerText =listTxAd[index];
       a.target="_blank"
       a.href= "https://cardanoscan.io/transaction/"+listTxAd[index]
       Trax.append(a); 
       let Time = document.createElement('td')
       Time.innerText = this.returnDateTx(tx); 
       let Metadata = document.createElement('td');
       Metadata.innerText = this.returnTxMetadata(listTxAd[index]); 
       let Details = document.createElement('td');
       Details.innerText = infoTx[2]; 

       txBoardBodyRaw.append(FromAddress,ToAddress,Trax,Time,Metadata, Details);
       txBoardTable.append(txBoardBodyRaw);
 }
 catch{alert('error')};
       }) 

   //  }) 
    



 }


    render()
    {

        return (
            <div style={{margin: "20px"}}>



                <h1>Board</h1>
               
               

                <Tabs id="TabsExample" vertical={true} onChange={this.handleTabId} selectedTabId={this.state.selectedTabId}>

                <Tab id="1" title="Setup" panel={
                        <div style={{marginLeft: "20px"}}>
 <div style={{paddingTop: "10px"}}>
                    <RadioGroup
                        label="Select Wallet:"
                        onChange={this.handleWalletSelect}
                        selectedValue={this.state.whichWalletSelected}
                        inline={true}
                    >
                        <Radio label="Nami" value="nami" />
                        <Radio label="CCvault" value="ccvault" />
                        <Radio label="Flint" value="flint" />
                    </RadioGroup>
                </div>

                <button style={{padding: "10px"}} onClick={this.testAlert}>Load Wallet</button>

                <button style={{padding: "20px"}} onClick={this.refreshData}>Refresh</button>

                <p style={{paddingTop: "20px"}}><span style={{fontWeight: "bold"}}>Wallet Found: </span>{`${this.state.walletFound}`}</p>
                <p><span style={{fontWeight: "bold"}}>Wallet Connected: </span>{`${this.state.walletIsEnabled}`}</p>
                <p><span style={{fontWeight: "bold"}}>Wallet API version: </span>{this.state.walletAPIVersion}</p>
                <p><span style={{fontWeight: "bold"}}>Wallet name: </span>{this.state.walletName}</p>

                <p><span style={{fontWeight: "bold"}}>Network Id (0 = testnet; 1 = mainnet): </span>{this.state.networkId}</p>
<p style={{paddingTop: "20px"}}><span style={{fontWeight: "bold"}}>UTXOs: (UTXO #txid = ADA amount + AssetAmount + policyId.AssetName + ...): 
                </span>{this.state.Utxos?.map(x => <li style={{fontSize: "10px"}} key={`${x.str}${x.multiAssetStr}`}>{`${x.str}${x.multiAssetStr}`}</li>)}</p>
                               <p style={{paddingTop: "20px"}}><span style={{fontWeight: "bold"}}>Balance: </span>{this.state.balance}</p>
                <p><span style={{fontWeight: "bold"}}>Change Address: </span>{this.state.changeAddress}</p>
                <p><span style={{fontWeight: "bold"}}>Staking Address: </span>{this.state.rewardAddress}</p>
                <p><span style={{fontWeight: "bold"}}>Used Address: </span>{this.state.usedAddress}</p>
                <hr style={{marginTop: "40px", marginBottom: "40px"}}/>
                        </div>
                    } />

<Tab id="2" title="Certification and Deed" panel={
                        <div style={{marginLeft: "20px"}}>
                <p id="certificationSpace"></p>
             
                        </div>
                    } />
<Tab id="3" title="Account transaction" panel={
                        <div style={{marginLeft: "20px"}}>
                <div id="txBoard"> </div> 
             
                        </div>
                    } />

<Tab id="4" title="Product transaction" panel={
                        <div style={{marginLeft: "20px"}}>
                <div id="txBoard"> </div> 
             
                        </div>
                    } />

<Tab id="5" title="Stock Management" panel={
                        <div style={{marginLeft: "20px"}}>
                     <p id="prodSpace"></p>
             
             
                        </div>
                    } />

<Tab id="6" title="Product transfer" panel={
                       <div style={{marginLeft: "20px"}}>

                       <FormGroup
                           helperText="insert an address where you want to send some Asset ..."
                           label="Address where to send Asset"
                       >
                           <InputGroup
                               disabled={false}
                               leftIcon="id-number"
                               onChange={(event) => this.setState({addressBech32SendADA: event.target.value})}
                               value={this.state.addressBech32SendADA}

                           />
                       </FormGroup>
                       <FormGroup
                           helperText="Make sure you have enough of Asset in your wallet ..."
                           label="Amount of Assets to Send"
                           labelFor="asset-amount-input"
                       >
                           <NumericInput
                               id="asset-amount-input"
                               disabled={false}
                               leftIcon={"variable"}
                               allowNumericCharactersOnly={true}
                               value={this.state.assetAmountToSend}
                               min={1}
                               stepSize={1}
                               majorStepSize={1}
                               onValueChange={(event) => this.setState({assetAmountToSend: event})}
                           />
                       </FormGroup>
                       <FormGroup
                           helperText="Hex of the Policy Id"
                           label="Asset PolicyId"
                       >
                           <InputGroup
                               disabled={false}
                               leftIcon="id-number"
                               onChange={(event) => this.setState({assetPolicyIdHex: event.target.value})}
                               value={this.state.assetPolicyIdHex}

                           />
                       </FormGroup>
                       <FormGroup
                           helperText="Hex of the Asset Name"
                           label="Asset Name"
                       >
                           <InputGroup
                               disabled={false}
                               leftIcon="id-number"
                               onChange={(event) => this.setState({assetNameHex: event.target.value})}
                               value={this.state.assetNameHex}

                           />
                       </FormGroup>

                       <FormGroup
                           helperText="Metadata"
                           label="Metadata"
                       >
                           <InputGroup
                               disabled={false}
                               leftIcon="id-number"
                               onChange={(event) => this.setState({metadataHex: event.target.value})}
                               value={this.state.metadataHex}

                           />
                       </FormGroup>

                       <button style={{padding: "10px"}} onClick={this.buildSendTokenTransaction}>Run</button>
                   </div>
                    } />



                  <Tab id="7" title="Transfer" panel={
                          <div style={{marginLeft: "20px"}}>

                          <FormGroup
                              helperText="insert an address where you want to send some ADA ..."
                              label="Address where to send ADA"
                          >
                              <InputGroup
                                  disabled={false}
                                  leftIcon="id-number"
                                  onChange={(event) => this.setState({addressBech32SendADA: event.target.value})}
                                  value={this.state.addressBech32SendADA}

                              />
                          </FormGroup>
                          <FormGroup
                              helperText="Adjust Order Amount ..."
                              label="Lovelaces (1 000 000 lovelaces = 1 ADA)"
                              labelFor="order-amount-input2"
                          >
                              <NumericInput
                                  id="order-amount-input2"
                                  disabled={false}
                                  leftIcon={"variable"}
                                  allowNumericCharactersOnly={true}
                                  value={this.state.lovelaceToSend}
                                  min={1000000}
                                  stepSize={1000000}
                                  majorStepSize={1000000}
                                  onValueChange={(event) => this.setState({lovelaceToSend: event})}
                              />
                          </FormGroup>

                          <button style={{padding: "10px"}} onClick={this.buildSendADATransaction}>Run</button>
                      </div>
                    } />

<Tab id="8" title="Group" panel={
                          <div style={{marginLeft: "20px"}}>
                            <ul class="pizza-toppings">
                            <li class="meat">Group_one</li>
                              <li class="meat">Group_one</li>
                              <li class="vegetarian">Group_one</li>
                              <li class="vegetarian vegan">Group_one</li>
                                 <li class="vegetarian vegan">Group_one</li>
                              </ul>

                     
                      </div>
                    } />

<Tab id="9" title="Options" panel={
                          <div style={{marginLeft: "20px"}}>

                  
                      </div>
                    } />


                   
                    <Tabs.Expander />
                </Tabs>

                <hr style={{marginTop: "40px", marginBottom: "40px"}}/>

                {/*<p>{`Unsigned txBodyCborHex: ${this.state.txBodyCborHex_unsigned}`}</p>*/}
                {/*<p>{`Signed txBodyCborHex: ${this.state.txBodyCborHex_signed}`}</p>*/}
                <p>{`Submitted Tx Hash: ${this.state.submittedTxHash}`}</p>
                <p>{this.state.submittedTxHash ? 'check your wallet !' : ''}</p>



            </div>
        )


     /*   <Tab id="21" title="1. Send ADA to Address" panel={
            <div style={{marginLeft: "20px"}}>

                <FormGroup
                    helperText="insert an address where you want to send some ADA ..."
                    label="Address where to send ADA"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({addressBech32SendADA: event.target.value})}
                        value={this.state.addressBech32SendADA}

                    />
                </FormGroup>
                <FormGroup
                    helperText="Adjust Order Amount ..."
                    label="Lovelaces (1 000 000 lovelaces = 1 ADA)"
                    labelFor="order-amount-input2"
                >
                    <NumericInput
                        id="order-amount-input2"
                        disabled={false}
                        leftIcon={"variable"}
                        allowNumericCharactersOnly={true}
                        value={this.state.lovelaceToSend}
                        min={1000000}
                        stepSize={1000000}
                        majorStepSize={1000000}
                        onValueChange={(event) => this.setState({lovelaceToSend: event})}
                    />
                </FormGroup>

                <button style={{padding: "10px"}} onClick={this.buildSendADATransaction}>Run</button>
            </div>
        } />
        
        <Tab id="22" title="2. Send Token to Address" panel={
            <div style={{marginLeft: "20px"}}>

                <FormGroup
                    helperText="insert an address where you want to send some ADA ..."
                    label="Address where to send ADA"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({addressBech32SendADA: event.target.value})}
                        value={this.state.addressBech32SendADA}

                    />
                </FormGroup>
                <FormGroup
                    helperText="Make sure you have enough of Asset in your wallet ..."
                    label="Amount of Assets to Send"
                    labelFor="asset-amount-input"
                >
                    <NumericInput
                        id="asset-amount-input"
                        disabled={false}
                        leftIcon={"variable"}
                        allowNumericCharactersOnly={true}
                        value={this.state.assetAmountToSend}
                        min={1}
                        stepSize={1}
                        majorStepSize={1}
                        onValueChange={(event) => this.setState({assetAmountToSend: event})}
                    />
                </FormGroup>
                <FormGroup
                    helperText="Hex of the Policy Id"
                    label="Asset PolicyId"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({assetPolicyIdHex: event.target.value})}
                        value={this.state.assetPolicyIdHex}

                    />
                </FormGroup>
                <FormGroup
                    helperText="Hex of the Asset Name"
                    label="Asset Name"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({assetNameHex: event.target.value})}
                        value={this.state.assetNameHex}

                    />
                </FormGroup>

                <FormGroup
                    helperText="Metadata"
                    label="Metadata"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({metadataHex: event.target.value})}
                        value={this.state.metadataHex}

                    />
                </FormGroup>

                <button style={{padding: "10px"}} onClick={this.buildSendTokenTransaction}>Run</button>
            </div>
        } />
       
        <Tab id="23" title="3. Send ADA to Plutus Script" panel={
            <div style={{marginLeft: "20px"}}>
                <FormGroup
                    helperText="insert a Script address where you want to send some ADA ..."
                    label="Script Address where to send ADA"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({addressScriptBech32: event.target.value})}
                        value={this.state.addressScriptBech32}

                    />
                </FormGroup>
                <FormGroup
                    helperText="Adjust Order Amount ..."
                    label="Lovelaces (1 000 000 lovelaces = 1 ADA)"
                    labelFor="order-amount-input2"
                >
                    <NumericInput
                        id="order-amount-input2"
                        disabled={false}
                        leftIcon={"variable"}
                        allowNumericCharactersOnly={true}
                        value={this.state.lovelaceToSend}
                        min={1000000}
                        stepSize={1000000}
                        majorStepSize={1000000}
                        onValueChange={(event) => this.setState({lovelaceToSend: event})}
                    />
                </FormGroup>
                <FormGroup
                    helperText="insert a Datum ..."
                    label="Datum that locks the ADA at the script address ..."
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({datumStr: event.target.value})}
                        value={this.state.datumStr}

                    />
                </FormGroup>
                <button style={{padding: "10px"}} onClick={this.buildSendAdaToPlutusScript}>Run</button>
            </div>
        } />
        <Tab id="24" title="4. Send Token to Plutus Script" panel={
            <div style={{marginLeft: "20px"}}>
                <FormGroup
                    helperText="Script address where ADA is locked ..."
                    label="Script Address"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({addressScriptBech32: event.target.value})}
                        value={this.state.addressScriptBech32}

                    />
                </FormGroup>
                <FormGroup
                    helperText="Need to send ADA with Tokens ..."
                    label="Lovelaces (1 000 000 lovelaces = 1 ADA)"
                    labelFor="order-amount-input2"
                >
                    <NumericInput
                        id="order-amount-input2"
                        disabled={false}
                        leftIcon={"variable"}
                        allowNumericCharactersOnly={true}
                        value={this.state.lovelaceToSend}
                        min={1000000}
                        stepSize={1000000}
                        majorStepSize={1000000}
                        onValueChange={(event) => this.setState({lovelaceToSend: event})}
                    />
                </FormGroup>
                <FormGroup
                    helperText="Make sure you have enough of Asset in your wallet ..."
                    label="Amount of Assets to Send"
                    labelFor="asset-amount-input"
                >
                    <NumericInput
                        id="asset-amount-input"
                        disabled={false}
                        leftIcon={"variable"}
                        allowNumericCharactersOnly={true}
                        value={this.state.assetAmountToSend}
                        min={1}
                        stepSize={1}
                        majorStepSize={1}
                        onValueChange={(event) => this.setState({assetAmountToSend: event})}
                    />
                </FormGroup>
                <FormGroup
                    helperText="Hex of the Policy Id"
                    label="Asset PolicyId"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({assetPolicyIdHex: event.target.value})}
                        value={this.state.assetPolicyIdHex}

                    />
                </FormGroup>
                <FormGroup
                    helperText="Hex of the Asset Name"
                    label="Asset Name"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({assetNameHex: event.target.value})}
                        value={this.state.assetNameHex}

                    />
                </FormGroup>
                <FormGroup
                    helperText="insert a Datum ..."
                    label="Datum that locks the ADA at the script address ..."
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({datumStr: event.target.value})}
                        value={this.state.datumStr}

                    />
                </FormGroup>
                <button style={{padding: "10px"}} onClick={this.buildSendTokenToPlutusScript}>Run</button>
            </div>
        } />
        <Tab id="25" title="5. Redeem ADA from Plutus Script" panel={
            <div style={{marginLeft: "20px"}}>
                <FormGroup
                    helperText="Script address where ADA is locked ..."
                    label="Script Address"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({addressScriptBech32: event.target.value})}
                        value={this.state.addressScriptBech32}

                    />
                </FormGroup>
                <FormGroup
                    helperText="content of the plutus script encoded as CborHex ..."
                    label="Plutus Script CborHex"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({plutusScriptCborHex: event.target.value})}
                        value={this.state.plutusScriptCborHex}

                    />
                </FormGroup>
                <FormGroup
                    helperText="Transaction hash ... If empty then run n. 3 first to lock some ADA"
                    label="UTXO where ADA is locked"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({transactionIdLocked: event.target.value})}
                        value={this.state.transactionIdLocked}

                    />
                </FormGroup>
                <FormGroup
                    helperText="UTXO IndexId#, usually it's 0 ..."
                    label="Transaction Index #"
                    labelFor="order-amount-input2"
                >
                    <NumericInput
                        id="order-amount-input2"
                        disabled={false}
                        leftIcon={"variable"}
                        allowNumericCharactersOnly={true}
                        value={this.state.transactionIndxLocked}
                        min={0}
                        stepSize={1}
                        majorStepSize={1}
                        onValueChange={(event) => this.setState({transactionIndxLocked: event})}
                    />
                </FormGroup>
                <FormGroup
                    helperText="Adjust Order Amount ..."
                    label="Lovelaces (1 000 000 lovelaces = 1 ADA)"
                    labelFor="order-amount-input2"
                >
                    <NumericInput
                        id="order-amount-input2"
                        disabled={false}
                        leftIcon={"variable"}
                        allowNumericCharactersOnly={true}
                        value={this.state.lovelaceLocked}
                        min={1000000}
                        stepSize={1000000}
                        majorStepSize={1000000}
                        onValueChange={(event) => this.setState({lovelaceLocked: event})}
                    />
                </FormGroup>
                <FormGroup
                    helperText="insert a Datum ..."
                    label="Datum that unlocks the ADA at the script address ..."
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({datumStr: event.target.value})}
                        value={this.state.datumStr}

                    />
                </FormGroup>
                <FormGroup
                    helperText="Needs to be enough to execute the contract ..."
                    label="Manual Fee"
                    labelFor="order-amount-input2"
                >
                    <NumericInput
                        id="order-amount-input2"
                        disabled={false}
                        leftIcon={"variable"}
                        allowNumericCharactersOnly={true}
                        value={this.state.manualFee}
                        min={160000}
                        stepSize={100000}
                        majorStepSize={100000}
                        onValueChange={(event) => this.setState({manualFee: event})}
                    />
                </FormGroup>
                <button style={{padding: "10px"}} onClick={this.buildRedeemAdaFromPlutusScript}>Run</button>
               // {<button style={{padding: "10px"}} onClick={this.signTransaction}>2. Sign Transaction</button>}
               // {<button style={{padding: "10px"}} onClick={this.submitTransaction}>3. Submit Transaction</button>}
            </div>
        } />
        <Tab id="26" title="6. Redeem Tokens from Plutus Script" panel={
            <div style={{marginLeft: "20px"}}>
                <FormGroup
                    helperText="Script address where ADA is locked ..."
                    label="Script Address"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({addressScriptBech32: event.target.value})}
                        value={this.state.addressScriptBech32}

                    />
                </FormGroup>
                <FormGroup
                    helperText="content of the plutus script encoded as CborHex ..."
                    label="Plutus Script CborHex"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({plutusScriptCborHex: event.target.value})}
                        value={this.state.plutusScriptCborHex}

                    />
                </FormGroup>
                <FormGroup
                    helperText="Transaction hash ... If empty then run n. 3 first to lock some ADA"
                    label="UTXO where ADA is locked"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({transactionIdLocked: event.target.value})}
                        value={this.state.transactionIdLocked}

                    />
                </FormGroup>
                <FormGroup
                    helperText="UTXO IndexId#, usually it's 0 ..."
                    label="Transaction Index #"
                    labelFor="order-amount-input2"
                >
                    <NumericInput
                        id="order-amount-input2"
                        disabled={false}
                        leftIcon={"variable"}
                        allowNumericCharactersOnly={true}
                        value={this.state.transactionIndxLocked}
                        min={0}
                        stepSize={1}
                        majorStepSize={1}
                        onValueChange={(event) => this.setState({transactionIndxLocked: event})}
                    />
                </FormGroup>
                <FormGroup
                    helperText="Adjust Order Amount ..."
                    label="Lovelaces (1 000 000 lovelaces = 1 ADA)"
                    labelFor="order-amount-input2"
                >
                    <NumericInput
                        id="order-amount-input2"
                        disabled={false}
                        leftIcon={"variable"}
                        allowNumericCharactersOnly={true}
                        value={this.state.lovelaceLocked}
                        min={1000000}
                        stepSize={1000000}
                        majorStepSize={1000000}
                        onValueChange={(event) => this.setState({lovelaceLocked: event})}
                    />
                </FormGroup>
                <FormGroup
                    helperText="Make sure you have enough of Asset in your wallet ..."
                    label="Amount of Assets to Reedem"
                    labelFor="asset-amount-input"
                >
                    <NumericInput
                        id="asset-amount-input"
                        disabled={false}
                        leftIcon={"variable"}
                        allowNumericCharactersOnly={true}
                        value={this.state.assetAmountToSend}
                        min={1}
                        stepSize={1}
                        majorStepSize={1}
                        onValueChange={(event) => this.setState({assetAmountToSend: event})}
                    />
                </FormGroup>
                <FormGroup
                    helperText="Hex of the Policy Id"
                    label="Asset PolicyId"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({assetPolicyIdHex: event.target.value})}
                        value={this.state.assetPolicyIdHex}

                    />
                </FormGroup>
                <FormGroup
                    helperText="Hex of the Asset Name"
                    label="Asset Name"
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({assetNameHex: event.target.value})}
                        value={this.state.assetNameHex}

                    />
                </FormGroup>
                <FormGroup
                    helperText="insert a Datum ..."
                    label="Datum that unlocks the ADA at the script address ..."
                >
                    <InputGroup
                        disabled={false}
                        leftIcon="id-number"
                        onChange={(event) => this.setState({datumStr: event.target.value})}
                        value={this.state.datumStr}

                    />
                </FormGroup>
                <FormGroup
                    helperText="Needs to be enough to execute the contract ..."
                    label="Manual Fee"
                    labelFor="order-amount-input2"
                >
                    <NumericInput
                        id="order-amount-input2"
                        disabled={false}
                        leftIcon={"variable"}
                        allowNumericCharactersOnly={true}
                        value={this.state.manualFee}
                        min={160000}
                        stepSize={100000}
                        majorStepSize={100000}
                        onValueChange={(event) => this.setState({manualFee: event})}
                    />
                </FormGroup>
                <button style={{padding: "10px"}} onClick={this.buildRedeemTokenFromPlutusScript}>Run</button>
            </div>
        } /> */

    }
}
