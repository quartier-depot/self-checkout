import empty from '../../../assets/empty.svg';

export function NoProducts() {
    return (
            <>
                <div className={'select-none bg-slate-400 flex flex-wrap content-center justify-center h-full opacity-25'}>
                    <div className={'w-full text-center'}>
                        <img src={empty} alt="empty" className={'h-24 w-24 inline-block'} />
                        <p className={'text-xl'}>
                            YOU DON'T HAVE
                            <br />
                            ANY PRODUCTS TO SHOW
                        </p>
                    </div>
                </div>
            </>
    );
}
