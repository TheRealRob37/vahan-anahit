// Torn paper edge — place at the bottom of a dark section
// `color` = the fill color (matches the section ABOVE)
export default function TornEdge({ color = '#1e120a', flip = false }) {
  const path = `M0,60
    L0,35 C15,28 28,42 45,33 C58,26 70,40 88,30 C102,22 118,38 135,28
    C150,19 165,35 182,26 C196,18 210,34 228,24 C244,16 258,32 275,22
    C290,13 305,30 322,20 C338,11 352,28 370,18 C386,9  400,26 418,16
    C434,7  448,24 466,14 C482,5  496,22 514,12 C530,3  544,20 562,10
    C578,1  592,18 610,8  C626,0  640,16 658,6  C674,0  688,14 706,5
    C722,0  736,12 754,3  C770,0  784,10 802,2  C818,0  832,8  850,1
    C866,0  880,6  898,0  C914,0  928,4  946,0  C962,0  976,2  994,0
    C1010,0 1024,0 1042,0 C1058,0 1072,0 1090,0 C1106,0 1120,0 1138,0
    L1200,0 L1200,60 Z`

  return (
    <div
      style={{
        marginTop: flip ? 0 : -2,
        marginBottom: flip ? -2 : 0,
        lineHeight: 0,
        transform: flip ? 'scaleY(-1)' : 'none',
      }}
    >
      <svg
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        width="100%"
        height="50"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={path} fill={color} />
      </svg>
    </div>
  )
}
