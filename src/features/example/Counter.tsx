import type {RootState} from '@/app/store.ts'
import {useSelector, useDispatch} from 'react-redux'
import {decrement, increment, incrementByAmount} from './counterSlice'

export function Counter() {
    const count = useSelector((state: RootState) => state.counter.value)
    const dispatch = useDispatch()

    return (
        <div>
            <div>
                <button
                    aria-label="Increment value"
                    onClick={() => dispatch(increment())}
                >
                    Increment
                </button>
                <span>{count}</span>
                <button
                    aria-label="Decrement value"
                    onClick={() => dispatch(decrement())}
                >
                    Decrement
                </button>
            </div>
            <div>
                <button
                    aria-label="IncrementByAmount"
                    onClick={() => dispatch(incrementByAmount(5))}
                >
                    IncrementByAmount
                </button>
            </div>
        </div>
    )
}