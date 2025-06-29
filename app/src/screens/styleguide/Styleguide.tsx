import { Button } from "../../components/button/Button";
const add = new Audio('/assets/sounds/add.mp3');
const remove = new Audio('/assets/sounds/remove.mp3');
const alert = new Audio('/assets/sounds/alert.mp3');
const confirm = new Audio('/assets/sounds/confirm.mp3');
export function Styleguide() {

    return (
            <div className={'grid grid-cols-2 p-5 gap-2 bg-slate-950'}>

                <div className={'bg-slate-950 p-2 text-white border-2 border-white'}>
                    Background
                </div>

                <div className={'bg-slate-50 p-2'}>
                     Structure
                </div>

                <div className={'bg-slate-50 p-2'}>
                    <button
                            className={'rounded-lg w-full py-2 bg-emerald-700 text-white border-4 border-emerald-700 active:border-emerald-600 active:bg-emerald-600 uppercase'}>Primary
                        Button
                    </button>
                    <Button onClick={() => {}} type={'primary'}>Primary</Button>
                </div>

                <div className={'bg-slate-50 p-2'}>
                    <button
                            className={'rounded-lg w-full py-2 bg-slate-500 text-white border-4 border-slate-500 active:border-slate-400 active:bg-slate-400 uppercase'}>Disabled
                        Button
                    </button>
                    <Button onClick={() => {}} type={'primary'} disabled>Primary</Button>
                </div>


                <div className={'bg-slate-50 p-2'}>
                    <button
                            className={'rounded-lg w-full py-2 bg-emerald-400 border-4 border-emerald-400 text-emerald-950 active:border-emerald-300 active:bg-emerald-300 uppercase'}>Secondary
                        Button
                    </button>
                    <Button onClick={() => {}} type={'secondary'}>Secondary</Button>
                </div>


                <div className={'bg-slate-50 p-2'}>
                    <button
                            className={'rounded-lg w-full py-2 bg-emerald-400 border-4 border-emerald-700 text-emerald-950 active:border-emerald-300 active:bg-emerald-300 uppercase'}>Secondary
                        Button toggled
                    </button>
                    <Button onClick={() => {}} type={'secondary'} toggled>Secondary</Button>
                </div>

                <div className={'bg-slate-50 p-2'}>
                    <button
                            className={'rounded-lg w-full py-2 border-4 border-slate-500 uppercase text-slate-950'}>Tertiary
                        Button
                    </button>
                    <Button onClick={() => {}} type={'tertiary'}>Tertiary</Button>
                </div>

                <div className={'bg-slate-50 p-2'}>
                    <h1 className={'text-slate-950 text-2xl'}>Huge text-2xl</h1>
                    <p className={'text-slate-950 text-xl'}>Title text-xl</p>
                    <p className={'text-slate-950'}>Info text-l</p>
                </div>


                <div className={'bg-slate-50 p-2'}>
                    <h1>Sound</h1>
                    <a className={'text-blue-950 underline'} onClick={() => add.play()}>Add</a> | 
                    <a className={'text-blue-950 underline'} onClick={() => remove.play()}> Remove</a> | 
                    <a className={'text-blue-950 underline'} onClick={() => alert.play()}> Alert</a> | 
                    <a className={'text-blue-950 underline'} onClick={() => confirm.play()}> Confirm</a> 
                </div>

            </div>
    );
}