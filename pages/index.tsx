import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import CrytoDev from '../components/CrytoDev'

const Home: NextPage = () => {
  return (
    <div className='bg-sky-900 h-screen text-white font-bold font-mono'>
        <CrytoDev/>
    </div>
  )
}

export default Home
