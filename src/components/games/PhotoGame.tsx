import { LOCATION_PHOTO, PHOTO_GAME_HINT } from '../../lib/config'
import { prettyDate } from '../../lib/time'

type PhotoGameProps = {
  dateStr: string
}

/**
 * 24 October — a photo reveal. No win condition: the day simply shows the
 * photograph with its hint above.
 */
export function PhotoGame({ dateStr }: PhotoGameProps) {
  return (
    <div className="text-center">
      <p className="font-display mx-auto max-w-md text-xl leading-relaxed text-ink-500 italic sm:text-2xl">
        {PHOTO_GAME_HINT}
      </p>

      <div className="photo-frame mx-auto mt-8 max-w-sm">
        <img
          src={LOCATION_PHOTO}
          alt={`A mystery place for ${prettyDate(dateStr)}`}
          className="block aspect-[4/5] w-full object-cover"
        />
      </div>
    </div>
  )
}
