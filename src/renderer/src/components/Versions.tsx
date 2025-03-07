import { useState, useEffect } from 'react'

function Versions(): JSX.Element {
    const [versions] = useState(window.electron.process.versions)
    const [data, setData] = useState('')

    const onSendMyapp = (): void => {
        fetch('myapp://data/?abc=123&e=333')
            .then(res => {
                return res.json()
            })
            .then(res => {
                console.log(9, res)
                setData(JSON.stringify(res))
            })
    }

    useEffect(() => {}, [])
    return (
        <>
            <ul className="versions">
                <li className="electron-version">Electron v{versions.electron}</li>
                <li className="chrome-version">Chromium v{versions.chrome}</li>
                <li className="node-version">Node v{versions.node}</li>
            </ul>
            <button onClick={onSendMyapp}>send</button>
            <div>Result::{data}</div>
        </>
    )
}

export default Versions
