import { Grid } from '@react-three/drei'

export default function GridFloor() {
  return (
    <Grid
      position={[0, -2.4, 0]}
      args={[200, 200]}
      cellSize={0.6}
      cellThickness={0.6}
      cellColor="#2b0d15"
      sectionSize={3}
      sectionThickness={1}
      sectionColor="#4a1420"
      fadeDistance={70}
      fadeStrength={2}
      infiniteGrid
    />
  )
}