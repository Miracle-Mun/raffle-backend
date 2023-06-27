import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import { useAnchorWallet, useWallet } from "@solana/wallet-adapter-react";
import { FileUploader } from "react-drag-drop-files";
import { toast, ToastContainer } from 'react-toastify'

import { Metaplex,  keypairIdentity, bundlrStorage, MetaplexFile, BundlrStorageDriver, walletAdapterIdentity, toMetaplexFileFromBrowser } from "@metaplex-foundation/js";
import {
  Connection,
  Keypair,
  Commitment,
  ConnectionConfig,
  clusterApiUrl
} from '@solana/web3.js';


import CONFIG from "../../../config";
import Menus from "../../../components/Menus"
import Navbar from "../../../components/Navbar"
import commonService from "../../../services/common.service";
import { IRLCreatealidation } from "../../../utils/validation";
import { CreateIrl } from "../../../services/contracts/irl";

const IRLCreate = () => {
  const { ADMIN_WALLET, API_URL, BUNDLR_URL } = CONFIG
  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const [file, setFile] = useState();
  const fileTypes = [
    "JPG",
    "PNG",
    "GIF",
    "SVG",
    "MP4",
    "WEBM",
    "MP3",
    "WAV",
    "OGG",
    "GLB",
    "GLTF",
    "AVIF",
    "WEBP",
  ];
  const [irlCreate, setIrlCreate] = useState<any>({
    imageSize: 0,
    name: ``,
    symbol: ``,
    description: ``,
    contentType: ``
  })

  const [nftImage, setNftImage] = useState<any>()

  const handleChange = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const base64Index = e.target.result.indexOf("base64,");
      const length = e.target.result.length;
      setIrlCreate({
        ...irlCreate,
        // image: e.target.result.substr(base64Index + 7, length),
        imageSize: e.total,
      })
    };

    console.log('file', file)
    reader.readAsDataURL(file);
    setFile(file);
    setNftImage(file)


    // setIrlCreate({
    //   ...irlCreate,
    //   contentType: file.name
    // })
  };

  const handleNFTMint = async () => {
    try {
      if (!anchorWallet) {
        toast.error(`Please connect Admin Wallet`)
        return
      }
      if (anchorWallet.publicKey.toBase58() !== ADMIN_WALLET) {
        toast.error(`Create IRL is allowed Admin Wallet`)
        return
      }

      const validation = IRLCreatealidation(irlCreate, nftImage);
      if (!validation) return
      setLoading(true)
      
      const connection = new Connection(CONFIG.CLUSTER_API);
      const metaplex = Metaplex.make(connection, { cluster:  'mainnet-beta'})
        .use(walletAdapterIdentity(wallet))
        .use(bundlrStorage({
          address: BUNDLR_URL,
          providerUrl: CONFIG.CLUSTER_API,
          timeout: 60000,
        }));

      const payload = new FormData()
      console.log("metaplex", metaplex)  
      payload.append('imageSize', irlCreate.imageSize)
      payload.append('name', irlCreate.name)
      payload.append('description', irlCreate.description)

      // const getUri = await commonService({
      //   method: 'post',
      //   route: `${API_URL}/irl`,
      //   data: payload
      // })
      // console.log("getUri", getUri)
       
      const bundlr = metaplex.storage().driver() as BundlrStorageDriver;

      // let imageUrl;
      // try {
      //   imageUrl = await bundlr.upload({
      //     buffer: Buffer.from(irlCreate.image),
      //     fileName: irlCreate.name,
      //     displayName: 'image',
      //     uniqueName: 'img',
      //     contentType: irlCreate.contentType,
      //     extension: null,
    
      //     tags: []
      //   });
    
      //   console.log('imageUrl', imageUrl)
      // } catch (error) {
      //   console.log('imageUrl error', error)
      // }

      const { uri } = await metaplex.nfts().uploadMetadata({
        name: irlCreate.name,
        description: irlCreate.description,
        image: await toMetaplexFileFromBrowser(nftImage),
        collection: {
          name: 'coode'
        },
        mintAuthority: anchorWallet.publicKey?.toString(),
        freezeAuthoriy: anchorWallet.publicKey?.toString()  
      })

      const data = {
        metaplex,
        name: irlCreate.name,
        symbol: irlCreate.symbol,
        uri
      }
      console.log("data", data)
      const IrlCreateTx: any = await CreateIrl(data)

      if (IrlCreateTx) {
        toast.success(`Successfully IRL Created`)
      } else {
        toast.error(`Occur Error IRL Creating`)
      }

      setLoading(false)
    } catch (error) {
      toast.error('Error Creating')
      setLoading(false)
    }
  }

  useEffect(() => {
    (
      async () => {
        try {
          if (!anchorWallet) return
          if (anchorWallet.publicKey?.toString() !== ADMIN_WALLET) {
            navigate('/')
            return
          }
        } catch (error) {
          setLoading(false)
        }
      }
    )()
  }, [anchorWallet])

  return (
    <div className="relative" >
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <Navbar />
      <Menus />

      <div className="max-w-[810px] m-auto pt-20 pb-16 px-4 md:px-0">
        <h1 className="text-center text-white text-4xl">Create IRL</h1>
        <div className="border-4 mt-6 md:px-8 px-4 pt-8 pb-14 border-[#606060] bg-[#60606040] rounded-[0.7rem]">
          <div className="md:flex block justify-between items-start">
            <div className="basis-[48%] dark:bg-jacarta-700 dark:border-jacarta-600 border-jacarta-100 group relative flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed bg-white py-20 px-5 text-center">
              <div className="relative z-10 cursor-pointer">
                {!file ? (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="fill-jacarta-500 mb-4 inline-block dark:fill-white"
                    >
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M16 13l6.964 4.062-2.973.85 2.125 3.681-1.732 1-2.125-3.68-2.223 2.15L16 13zm-2-7h2v2h5a1 1 0 0 1 1 1v4h-2v-3H10v10h4v2H9a1 1 0 0 1-1-1v-5H6v-2h2V9a1 1 0 0 1 1-1h5V6zM4 14v2H2v-2h2zm0-4v2H2v-2h2zm0-4v2H2V6h2zm0-4v2H2V2h2zm4 0v2H6V2h2zm4 0v2h-2V2h2zm4 0v2h-2V2h2z" />
                    </svg>
                    <p className="dark:text-jacarta-300 mx-auto max-w-xs text-xs">
                      JPG, PNG, GIF,AVIF, WEBP, SVG, MP4, WEBM, MP3, WAV, OGG,
                      GLB, GLTF. Max size: 100 MB
                    </p>
                  </>
                ) : (
                  <img
                    src={URL.createObjectURL(file)}
                  />
                )}
              </div>
              <div className="dark:bg-jacarta-600 bg-jacarta-50 absolute inset-4 cursor-pointer rounded opacity-0 group-hover:opacity-100 ">
                <FileUploader
                  handleChange={handleChange}
                  name="file"
                  types={fileTypes}
                  classes="file-drag"
                  maxSize={10000000}
                  minSize={0}
                />
              </div>
              {/* <input type="file" onChange={(e: any) => setIrlCreate({ ...irlCreate, image: e.target.files[0] })} /> */}

            </div>


            <div className="basis-[48%]">

              <div className="mb-5">
                <label
                  className="text-white text-lg inline-block mb-1"
                  htmlFor="discordlink"
                >
                  Name
                </label>
                <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                  <input
                    type="text"
                    id="twitterlink"
                    name="twitterlink"
                    placeholder="Name"
                    value={irlCreate.name}
                    onChange={(e) =>
                      setIrlCreate({
                        ...irlCreate,
                        name: e.target.value,
                      })
                    }
                    className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                  />
                </div>
              </div>
              <div className="mb-5">
                <label
                  className="text-white text-lg inline-block mb-1"
                  htmlFor="discordlink"
                >
                  Symbol
                </label>
                <div className="relative border-2 border-[#606060] rounded-[0.5rem] overflow-hidden">
                  <input
                    type="text"
                    id="twitterlink"
                    name="twitterlink"
                    placeholder="Symbol"
                    value={irlCreate.symbol}
                    onChange={(e) =>
                      setIrlCreate({
                        ...irlCreate,
                        symbol: e.target.value,
                      })
                    }
                    className="bg-[#46464680] w-full text-[#fff] placeholder:text-[#606060] p-3 outline-none"
                  />
                </div>
              </div>
              <div className="mb-5">
                <label
                  className="text-white text-lg inline-block mb-1"
                  htmlFor="description"
                >
                  Description
                </label>
                <div className="relative overflow-hidden">
                  <textarea
                    rows={3}
                    value={irlCreate.description}
                    onChange={(e) =>
                      setIrlCreate({
                        ...irlCreate,
                        description: e.target.value,
                      })
                    }
                    placeholder="description"
                    className="bg-[#46464680] border-2 border-[#606060] rounded-[0.5rem] w-full text-[#ffffff] placeholder:text-[#606060] p-3 outline-none resize-none h-full"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
        <div onClick={handleNFTMint} className="cursor-pointer text-black bg-white rounded-[0.5rem] flex items-center py-3 px-5 max-w-fit mx-[auto] my-0 mt-[-27px] ">MINT</div>
        <ToastContainer />
      </div>
    </div>

  )
}

export default IRLCreate
