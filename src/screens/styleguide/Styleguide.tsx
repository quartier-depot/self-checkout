export function Styleguide() {
    return (
            <div className={'grid grid-cols-2 p-5 gap-2'}>

                <div className={'bg-slate-100 p-2'}>
                    Background
                </div>

                <div className={'bg-slate-100'}>
                    <div className={'bg-white rounded-3xl m-2 shadow p-4'}>
                        Structure
                    </div>
                </div>

                <div className={'bg-slate-100'}>
                    <div className={'bg-white rounded-3xl m-2 shadow p-4'}>
                        <button
                                className={'rounded-2xl w-full py-4 bg-emerald-700 text-white border-4 border-emerald-700 active:border-emerald-600 active:bg-emerald-600 uppercase'}>Primary
                            Button
                        </button>
                    </div>
                </div>

                <div className={'bg-slate-100'}>
                    <div className={'bg-white rounded-3xl m-2 shadow p-4'}>
                        <button
                                className={'rounded-2xl w-full py-4 bg-slate-300 active:border-slate-200 active:bg-slate-200 uppercase'}>Disabled
                            Button
                        </button>
                    </div>
                </div>

                <div className={'bg-slate-100'}>
                    <div className={'bg-white rounded-3xl m-2 shadow p-4'}>
                        <button
                                className={'rounded-2xl w-full py-4 bg-emerald-400 border-4 border-emerald-400 text-emerald-950 active:border-emerald-300 active:bg-emerald-300 uppercase'}>Secondary
                            Button
                        </button>
                    </div>
                </div>

                <div className={'bg-slate-100'}>
                    <div className={'bg-white rounded-3xl m-2 shadow p-4'}>
                        <button
                                className={'rounded-2xl w-full py-4 bg-emerald-400 border-4 border-emerald-700 text-emerald-950 active:border-emerald-300 active:bg-emerald-300 uppercase'}>Secondary
                            Button toggled
                        </button>
                    </div>
                </div>


                <div className={'bg-slate-100'}>
                    <div className={'bg-white rounded-3xl m-2 shadow p-4'}>
                        <button
                                className={'rounded-2xl w-full py-4 border-4 border-slate-300 uppercase'}>Tertiary
                            Button
                        </button>
                    </div>
                </div>

                <div className={'bg-slate-100'}>
                    <div className={'bg-white rounded-3xl m-2 shadow p-4'}>
                        <h1 className={'text-slate-950 text-4xl'}>Huge text-8xl</h1>
                        <h1 className={'text-slate-950 text-2xl'}>Title text-2xl</h1>
                        <p className={'text-slate-950 text-xl'}>Text text-xl</p>
                        <p className={'text-slate-950 text-l'}>Info text-l</p>
                    </div>
                </div>
            </div>
    );
}