import { Button } from "../../components/button/Button";
import { Progress } from '../../components/progress/Progress.tsx';
import { CircularCountdown } from '../../components/circularCountdown/CircularCountdown.tsx';
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
                    <Button onClick={() => {}} type={'primary'}>Primary</Button>
                </div>

                <div className={'bg-slate-50 p-2'}>
                    <Button onClick={() => {}} type={'primary'} disabled withDisabledLock={true}>Primary disabled</Button>
                </div>


                <div className={'bg-slate-50 p-2'}>
                    <Button onClick={() => {}} type={'secondary'}>Secondary</Button>
                </div>
                
                <div className={'bg-slate-50 p-2'}>
                    <Button onClick={() => {}} type={'secondary'} disabled withDisabledLock={true}>Secondary disabled</Button>
                </div>


                <div className={'bg-slate-50 p-2'}>
                    <Button onClick={() => {}} type={'secondary'} toggled>Secondary Toggled</Button>
                </div>

                <div className={'bg-slate-50 p-2'}>
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

                <div className={'bg-slate-50 p-2'}>
                    <h1>Progress</h1>
                    <Progress percentage={25} maxPercentage={75} estimatedTime={10000}/>
                </div>

                <div className={'bg-slate-50 p-2'}>
                    <h1>Circular Countdown</h1>
                    <CircularCountdown duration={10000} />
                </div>

            </div>
    );
}