// Each Major Arcana has a distinct, original geometric composition.
export function ArcanaSymbol({ id, tone }: { id: number; tone: string }) {
  const ink = '#070f2a';
  const light = '#eff8df';
  switch (id) {
    case 0:
      return (
        <g>
          <circle cx="158" cy="104" r="31" fill={tone} />
          <path d="m40 270 47-70 43 20 19 57 48 33H40z" fill="#163b84" />
          <path d="m96 312 19-87-30-26 43-44 34 38-28 34 14 82-27-47z" fill={light} />
          <path d="m88 161 20-27 27 8 8 20-38 9z" fill={ink} />
          <path d="m43 317 22-29 10 7-11 23z" fill={tone} />
          <path d="M48 120h37M66 101v37M177 246h26M190 233v26" stroke={tone} strokeWidth="3" />
          <path d="m163 178 23-35 6 38z" fill={tone} />
        </g>
      );
    case 1:
      return (
        <g>
          <path d="m59 91 22 27-10 117 49 54 51-54-10-117 22-27 10 170-73 70-73-70z" fill={tone} />
          <path d="m120 93 45 84-45 84-45-84z" fill={light} />
          <path d="m120 132 24 45-24 45-24-45z" fill={ink} />
          <path d="M45 284h150M120 61v62" stroke={tone} strokeWidth="4" />
          <path
            d="M88 79c20-24 44 24 64 0s-4-24-16-12-37 24-48 12Z"
            fill="none"
            stroke={light}
            strokeWidth="3"
          />
          <circle cx="120" cy="290" r="10" fill={tone} />
          <path d="M55 324h130" stroke={light} />
        </g>
      );
    case 2:
      return (
        <g>
          <path d="M44 80h35v237H44z" fill={tone} />
          <path d="M161 80h35v237h-35z" fill={light} />
          <path d="M83 80h74v237H83z" fill="#2445a3" />
          <circle cx="120" cy="126" r="30" fill={light} />
          <circle cx="130" cy="115" r="27" fill="#2445a3" />
          <path d="m120 165 38 121-38 37-37-37z" fill={tone} />
          <path d="m86 244 34-15 34 15v36l-34-15-34 15z" fill={ink} />
          <path d="M120 231v33" stroke={light} />
          <path d="M58 109v180M178 109v180" stroke={ink} strokeWidth="3" />
        </g>
      );
    case 3:
      return (
        <g>
          <circle cx="120" cy="181" r="61" fill={tone} />
          <path d="m75 116-17-35 42 11 20-31 21 31 43-11-19 35z" fill={light} />
          <path d="m120 148 37 68-37 96-37-96z" fill={ink} />
          <circle cx="120" cy="174" r="15" fill={light} />
          <path d="m120 194-34 54h68z" fill={tone} />
          <path
            d="M45 311q23-76 39-122M195 311q-23-76-39-122"
            fill="none"
            stroke={light}
            strokeWidth="3"
          />
          {[0, 1, 2].map((i) => (
            <g key={i} fill={tone}>
              <path d={`m${52 + i * 8} ${279 - i * 28}-14-23 24 9z`} />
              <path d={`m${188 - i * 8} ${279 - i * 28} 14-23-24 9z`} />
            </g>
          ))}
        </g>
      );
    case 4:
      return (
        <g>
          <path d="M46 125h148v185H46z" fill={tone} />
          <path d="M64 141h112v146H64z" fill={ink} />
          <path d="m65 105-6-38 36 18 25-28 25 28 36-18-6 38z" fill={light} />
          <path d="m90 157 30-17 30 17v46l-16 20 25 64H81l25-64-16-20z" fill={tone} />
          <path d="M120 170v57M101 191h38" stroke={ink} strokeWidth="5" />
          <path d="M52 133v161M188 133v161" stroke={light} strokeWidth="3" />
          <path d="M36 318h168" stroke={light} strokeWidth="6" />
        </g>
      );
    case 5:
      return (
        <g>
          <path d="M46 315V143l74-77 74 77v172z" fill={tone} />
          <path d="M65 315V157l55-57 55 57v158z" fill={ink} />
          <path d="M120 109v112M91 145h58M97 164h46" stroke={light} strokeWidth="5" />
          <circle cx="93" cy="255" r="17" fill="none" stroke={tone} strokeWidth="6" />
          <circle cx="147" cy="255" r="17" fill="none" stroke={tone} strokeWidth="6" />
          <path
            d="m104 267 45 53m-13-53-45 53M135 305l-8 8m-22-8 8 8"
            stroke={light}
            strokeWidth="7"
          />
          <path d="m101 88 19-25 19 25" fill="none" stroke={light} strokeWidth="3" />
        </g>
      );
    case 6:
      return (
        <g>
          <circle cx="120" cy="114" r="35" fill={tone} />
          <path d="m120 108 23 39-23 24-23-24z" fill={light} />
          <path d="m47 306 8-105 34-29 29 38-20 47 16 49z" fill={tone} />
          <path d="m193 306-8-105-34-29-29 38 20 47-16 49z" fill={light} />
          <circle cx="84" cy="176" r="20" fill={ink} />
          <circle cx="156" cy="176" r="20" fill={ink} />
          <path d="m78 208 42 52 42-52M120 260v67" stroke={ink} strokeWidth="5" fill="none" />
          <path d="m120 238 20-20 12 12-32 38-32-38 12-12z" fill="#ee5e88" />
        </g>
      );
    case 7:
      return (
        <g>
          <path d="m120 66 55 45-55 45-55-45z" fill={tone} />
          <path d="m120 85 31 26-31 26-31-26z" fill={ink} />
          <path d="m81 164 39-21 39 21 25 93-64 41-64-41z" fill={light} />
          <path d="m120 174 21 52-21 34-21-34z" fill={ink} />
          <path d="M37 243h48l23 74H37z" fill={tone} />
          <path d="M203 243h-48l-23 74h71z" fill="#5c91ee" />
          <circle cx="65" cy="292" r="20" fill={ink} />
          <circle cx="175" cy="292" r="20" fill={ink} />
          <path d="M65 280v24m-12-12h24m98-12v24m-12-12h24" stroke={tone} strokeWidth="3" />
          <path d="M44 135h43M153 135h43" stroke={tone} strokeWidth="4" />
        </g>
      );
    case 8:
      return (
        <g>
          <path d="m120 99 53 35 26 66-26 68-53 42-53-42-26-68 26-66z" fill={tone} />
          <path d="m82 171 38-32 38 32-5 67-33 35-33-35z" fill={ink} />
          <path d="m88 189 19 5-8 15zM152 189l-19 5 8 15z" fill={light} />
          <path d="m109 229 11-9 11 9-11 15z" fill={tone} />
          <path d="M120 244v12m-17-3 17 6 17-6" stroke={light} strokeWidth="2" fill="none" />
          <path
            d="M84 87c18-21 54 21 72 0s-10-22-25-9-31 23-47 9Z"
            fill="none"
            stroke={light}
            strokeWidth="4"
          />
        </g>
      );
    case 9:
      return (
        <g>
          <path d="m130 96 27 34-27 46-36 99 72 48H55l30-178z" fill={tone} />
          <path d="m130 116 14 14-33 17z" fill={ink} />
          <path d="m99 168 52 12-3 15-59-5z" fill={tone} />
          <path d="M169 119v209" stroke={light} strokeWidth="5" />
          <path d="M138 148h49v72h-49z" fill={light} />
          <path d="M144 154h37v60h-37z" fill={ink} />
          <path d="m163 163 5 17 10 4-10 5-5 18-5-18-10-5 10-4z" fill={tone} />
          <path d="M122 185 43 157m79 33-72 39m77-33-27 85" stroke={light} strokeWidth="2" />
          <path d="M73 313h70" stroke={ink} strokeWidth="4" />
        </g>
      );
    case 10:
      return (
        <g>
          <circle cx="120" cy="202" r="80" fill={tone} />
          <circle cx="120" cy="202" r="65" fill={ink} />
          <circle cx="120" cy="202" r="48" fill="none" stroke={light} strokeWidth="2" />
          {[0, 45, 90, 135].map((a) => (
            <path
              key={a}
              d="M120 128v148"
              transform={`rotate(${a} 120 202)`}
              stroke={tone}
              strokeWidth="4"
            />
          ))}
          <circle cx="120" cy="202" r="23" fill={light} />
          <path d="m120 186 9 16-9 16-9-16z" fill={ink} />
          <path
            d="M56 103a99 99 0 0 1 125 5l-3-27 26 47-49-4 25-10M184 299a99 99 0 0 1-125-5l3 27-26-47 49 4-25 10"
            fill={light}
          />
        </g>
      );
    case 11:
      return (
        <g>
          <path d="M120 85v221M57 141h126" stroke={light} strokeWidth="6" />
          <path d="m120 63 19 25-19 26-19-26z" fill={tone} />
          <path d="m65 143-26 77h52zm110 0-26 77h52z" fill="none" stroke={tone} strokeWidth="3" />
          <path d="M34 219h61q-6 39-31 39t-30-39m111 0h61q-6 39-31 39t-30-39" fill={tone} />
          <path d="m120 179 12 65-12 25-12-25z" fill={tone} />
          <path d="M85 309h70l18 17H67z" fill={light} />
        </g>
      );
    case 12:
      return (
        <g>
          <path d="M51 95h138M171 77v235" stroke={light} strokeWidth="7" />
          <path d="m108 98 21 46-17 34 27 31-28 14-26-44 20-32-10-44z" fill={tone} />
          <path d="m110 171-35-14-14 27 12 8 12-19 21 11z" fill={light} />
          <path d="m97 214 31-9 25 55-29 26-34-26z" fill={tone} />
          <circle cx="115" cy="285" r="18" fill={light} />
          <circle cx="115" cy="285" r="31" fill="none" stroke={tone} strokeWidth="3" />
          <path d="m109 275 15 6-10 14-9-11z" fill={ink} />
        </g>
      );
    case 13:
      return (
        <g>
          <path d="m55 88 132 40-20 38-95-38-30 71z" fill={light} />
          <path d="M151 127 65 320" stroke={tone} strokeWidth="7" />
          <path d="m127 174 40 5 21 103-52 31-38-32z" fill={tone} />
          <path d="m130 183 30 3 2 34-29 12-17-23z" fill={ink} />
          <path d="m124 200 10-3 2 12-10 2m17-13 12 1-4 11-10-3" fill={light} />
          <path d="m71 261 16 16-16 32-16-32z" fill={light} />
          <path d="M48 315h47M168 314h24" stroke={light} strokeWidth="3" />
          <circle cx="182" cy="85" r="13" fill={tone} />
        </g>
      );
    case 14:
      return (
        <g>
          <path d="m120 80 20 37-20 37-20-37z" fill={light} />
          <path d="m52 146 60 8-9 43-29 9-21-24z" fill={tone} />
          <path d="m144 244 61-8-2 45-23 24-30-17z" fill={light} />
          <path d="M80 204v24m-16 3 31-2M179 304v16m-17 4 34-3" stroke={light} strokeWidth="4" />
          <path
            d="M100 180c55 15 5 69 52 80M108 170c77 22 4 74 56 82"
            fill="none"
            stroke={tone}
            strokeWidth="5"
          />
          <path d="m58 274 43-47 35 48z" fill="none" stroke={light} strokeWidth="3" />
          <circle cx="167" cy="155" r="27" fill="none" stroke={tone} strokeWidth="3" />
        </g>
      );
    case 15:
      return (
        <g>
          <path d="m80 159-25-60 45 24 20-38 20 38 45-24-25 60 23 59-63 59-63-59z" fill={tone} />
          <path d="m89 167 31 17 31-17-12 49-19 23-19-23z" fill={ink} />
          <path d="m82 170 25 15-10 12zm76 0-25 15 10 12z" fill={light} />
          <path d="M91 246 64 285m85-39 27 39" stroke={light} strokeWidth="3" />
          <g fill="none" stroke={light} strokeWidth="5">
            <ellipse cx="61" cy="281" rx="14" ry="19" transform="rotate(30 61 281)" />
            <ellipse cx="179" cy="281" rx="14" ry="19" transform="rotate(-30 179 281)" />
          </g>
          <path d="m118 195-16 57 18 29 18-29z" fill={ink} />
          <path d="M47 318h146" stroke={tone} strokeWidth="3" />
        </g>
      );
    case 16:
      return (
        <g>
          <path d="M84 314 95 149h55l17 165z" fill={tone} />
          <path d="m78 141-12-44 31 16 20-27 17 30 34-9-20 34z" fill={light} />
          <path d="m161 69-67 126h37l-42 88 80-122h-36l47-92z" fill={light} />
          <path d="M100 259h21v37h-21M141 275h17v27h-17" fill={ink} />
          <path
            d="m59 221 13 16-16 17-9-22m136-52 16-10 10 24-17 3M39 285l20-4 8 20-17 7"
            fill={tone}
          />
          <path d="M65 321h120" stroke={light} strokeWidth="5" />
        </g>
      );
    case 17:
      return (
        <g>
          <path
            d="m120 82 18 77 68-24-50 53 45 53-64-21-17 90-17-90-64 21 45-53-50-53 68 24z"
            fill={tone}
          />
          <path d="m120 135 8 46 35 7-35 11-8 44-8-44-35-11 35-7z" fill="#126bcc" />
          {[
            [56, 91, 7],
            [182, 102, 5],
            [185, 290, 7],
            [53, 272, 5],
            [144, 321, 4],
          ].map(([x, y, r]) => (
            <path
              key={x}
              d={`m${x} ${y - r * 2} ${r / 2} ${r * 1.5} ${r * 1.5} ${r / 2}-${r * 1.5} ${r / 2}-${r / 2} ${r * 1.5}-${r / 2}-${r * 1.5}-${r * 1.5}-${r / 2} ${r * 1.5}-${r / 2}z`}
              fill={light}
            />
          ))}
          <path d="M47 305q73-24 146 0M60 321q60-22 120 0" stroke={tone} fill="none" />
        </g>
      );
    case 18:
      return (
        <g>
          <circle cx="116" cy="150" r="65" fill={tone} />
          <circle cx="141" cy="126" r="57" fill={ink} />
          <path d="M34 285 77 224l43 34 38-50 47 77z" fill="#abbcff" />
          <path d="m120 242-19 36 36 23-20 37h32l10-40-38-24 10-24z" fill={tone} />
          <path
            d="M43 307h47m70 15h37M52 123h17M60 115v17M176 76h19M185 67v19"
            stroke={light}
            strokeWidth="2"
          />
          <path d="M64 244v-38h18v35m87 4v-51h17v62" fill={ink} />
        </g>
      );
    case 19:
      return (
        <g>
          {Array.from({ length: 12 }, (_, i) => (
            <path
              key={i}
              d="m114 70 6 28 6-28z"
              transform={`rotate(${i * 30} 120 171)`}
              fill={tone}
            />
          ))}
          <circle cx="120" cy="171" r="57" fill={tone} />
          <circle cx="120" cy="171" r="44" fill={light} />
          <path
            d="m99 168 9-6m24 0 9 6M107 188q13 12 26 0"
            stroke={ink}
            strokeWidth="4"
            fill="none"
          />
          <path d="M38 288q82-69 164 0v39H38z" fill={tone} />
          <path d="m61 316 34-44 26 22 26-31 37 53z" fill={ink} />
          <path d="M52 335h137" stroke={light} strokeWidth="3" />
        </g>
      );
    case 20:
      return (
        <g>
          <path d="m49 83 71 47 71-47-28 80-43 18-43-18z" fill={tone} />
          <circle cx="120" cy="111" r="18" fill={light} />
          <path d="m109 141 22 0-6 44 15 12-40 0 15-12z" fill={light} />
          <path d="M120 209v41M93 205l-19 32m73-32 19 32" stroke={light} strokeWidth="3" />
          <path d="M45 326v-49l28-17 26 17v49zm96 0v-49l27-17 27 17v49z" fill={tone} />
          <path d="m91 326 10-60 19-14 19 14 10 60z" fill={light} />
          <path d="M111 269h18v23h-18" fill={ink} />
          <path d="M39 332h162" stroke={light} strokeWidth="3" />
        </g>
      );
    case 21:
      return (
        <g>
          <ellipse cx="120" cy="204" rx="72" ry="115" fill="none" stroke={tone} strokeWidth="13" />
          <ellipse cx="120" cy="204" rx="56" ry="95" fill="none" stroke={light} strokeWidth="2" />
          <path d="m120 128 31 67-31 83-31-83z" fill={light} />
          <path d="m120 158 14 37-14 40-14-40z" fill={ink} />
          <path d="m120 277 12 20-12 22-12-22z" fill={tone} />
          {[
            [47, 87],
            [193, 87],
            [47, 320],
            [193, 320],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <path d={`m${x} ${y - 16} 12 16-12 16-12-16z`} fill={light} />
              <circle cx={x} cy={y} r="4" fill={ink} />
            </g>
          ))}
        </g>
      );
    default:
      return null;
  }
}
