import NodeClam from 'clamscan'
import fs from 'fs/promises'
import { ApplicationError } from './ApplicationError'

const ClamScan = new NodeClam().init({
    removeInfected: false,
    quarantineInfected: false,
    scanLog: '/tmp/clamav/scan.log',
    debugMode: false,
    clamdscan: {
        socket: '/var/run/clamav/clamd.sock',
        timeout: 30000,
    },
});

export const scanFileForViruses = async (filePath: string): Promise<void> => {
    const clamscan = await ClamScan;

    const { isInfected } = await clamscan.scanFile(filePath)
    if (isInfected) {
        await fs.unlink(filePath)
        throw new ApplicationError('File contains a virus and was rejected', 400)
    }
}
