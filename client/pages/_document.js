import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
    static async getInitialProps(ctx) {
        const initialProps = await Document.getInitialProps(ctx)
        return { ...initialProps }
    }

    render() {
        return (
            <Html>
                <Head>
                    <link href="https://hangeul.pstatic.net/hangeul_static/css/nanum-square.css" rel="stylesheet"></link>
                    {/*<script type="text/javascript" src="https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=r1c367pze3"/>*/}
                </Head>
                <body>
                <Main />
                <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument