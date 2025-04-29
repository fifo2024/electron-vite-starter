import { useState, useEffect } from 'react'
import { Systeminformation } from 'systeminformation'

const { electron } = window
const { ipcRenderer, process } = electron

function Versions(): JSX.Element {
    const [versions] = useState(process.versions)
    const [data, setData] = useState('')
    const [appVersion, setAppVersion] = useState('')
    const [systemInfo, setSystemInfo] = useState<{ cpu: Systeminformation.CpuData } | null>(null)

    const onSendMyapp = (): void => {
        fetch('myapp://data/?abc=123&e=333')
            .then(res => {
                return res.json()
            })
            .then(res => {
                setData(JSON.stringify(res))
            })
    }

    const onUpdater = (): void => {
        console.log('onUpdater::send::')
        ipcRenderer.send('checkUpdate')
    }

    useEffect(() => {
        ipcRenderer.invoke('getAppVersion').then(ver => {
            setAppVersion(ver)
        })

        fetch('myapp://get_system_info')
            .then(res => {
                return res.json()
            })
            .then(res => {
                console.log(38, res)
                setSystemInfo(res)
            })
    }, [])

    console.log(systemInfo)

    return (
        <>
            <ul className="versions">
                <li className="electron-version">Electron v{versions.electron}</li>
                <li className="chrome-version">Chromium v{versions.chrome}</li>
                <li className="node-version">Node v{versions.node}</li>
                <li className="node-version">App v{appVersion}</li>
            </ul>
            <div onClick={onUpdater}>Updater</div>
            <button onClick={onSendMyapp}>send</button>
            <div>Result::{data}</div>
            <div>{Math.random()}</div>
            <div>
                <div>
                    <span>CPU(核心数): </span>
                    <span>{systemInfo?.cpu.cores}</span>
                </div>
            </div>
        </>
    )
}

export default Versions
