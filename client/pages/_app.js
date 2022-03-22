import '../styles/globals.css'
import Layout from "../components/Layout";
import Head from 'next/head'
import {compose, createStore} from 'redux'
import {Provider} from "react-redux";
import rootReducer from "../service/modules";
import Login from "./auth/login";
import {useEffect} from "react";

const store = createStore(rootReducer)

function MyApp({Component, pageProps}) {
    useEffect(() => {
        console.log(Component.displayName)
    }, [])

    return <>
        <Head>
            <title>monitoring system</title>
        </Head>
        <Provider store={store}>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </Provider>

    </>
}

export default MyApp
