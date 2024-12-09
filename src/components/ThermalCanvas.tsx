import { useCallback, useEffect, useRef } from 'react'

type ThermalCanvasProps = {
    data: number[]
}

export default function ThermalCanvas({ data }: ThermalCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // シグモイド関数
    const sigmoid = (x: number): number => {
        return 1 / (1 + Math.exp(-x))
    }

    // 温度から色へ変換する関数
    const getColor = useCallback((value: number) => {
        const minTemp = 20
        const maxTemp = 40

        // 温度を-6から6の範囲にマッピング
        const x = ((value - minTemp) / (maxTemp - minTemp) * 12) - 6

        // 青から緑、緑から赤への変化を計算
        const r = Math.floor(255 * sigmoid(x * 2 - 3))  // 後半で赤が増加
        const g = Math.floor(255 * sigmoid(x * 2) * (1 - sigmoid(x * 2 - 3)))  // 中間で緑がピーク
        const b = Math.floor(255 * (1 - sigmoid(x * 2)))  // 前半で青が減少

        return `rgb(${r}, ${g}, ${b})`
    }, [])

    // キャンバスに描画する関数
    const drawThermalImage = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const width = 32
        const height = 24
        const pixelSize = 10

        canvas.width = width * pixelSize
        canvas.height = height * pixelSize

        data.forEach((temp, i) => {
            const x = (i % width) * pixelSize
            const y = Math.floor(i / width) * pixelSize

            ctx.fillStyle = getColor(temp)
            ctx.fillRect(x, y, pixelSize, pixelSize)
        })
    }, [data, getColor])

    useEffect(() => {
        drawThermalImage()
    }, [data, drawThermalImage])

    return (
        <canvas
            ref={canvasRef}
            className="border rounded"
            style={{
                imageRendering: 'pixelated',
                maxWidth: '100%',
                height: 'auto'
            }}
        />
    )
} 