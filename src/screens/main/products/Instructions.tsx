import scanIcon from '../../../assets/instructions/scan.png';
import searchIcon from '../../../assets/instructions/search.png';
import searchArrow from '../../../assets/instructions/search-arrow.png';
import quantityIcon from '../../../assets/instructions/quantity.png';
import memberIcon from '../../../assets/instructions/member.png';
import payIcon from '../../../assets/instructions/pay.png';

export function Instructions() {
    return (
        <div className="bg-slate-200 flex flex-col justify-center items-center h-full opacity-60">
            <div className="w-full max-w-md py-2 grid gap-16">
                {/* 1. Scan */}
                <div className="grid grid-cols-[1fr_3fr_1fr] items-center">
                    <div></div>
                    <div>
                        <div className="text-2xl font-bold">Scanne</div>
                        <div className="text-lg">Produkte mit Barcode</div>
                    </div>
                    <img src={scanIcon} alt="Scan" className="block justify-self-end" />
                </div>
                {/* 2. Search */}
                <div className="grid grid-cols-[1fr_3fr_1fr] items-center">
                    <img src={searchArrow} alt="Search Arrow" className="block justify-self-start -ml-8 mr-4" />
                    <div>
                        <div className="text-2xl font-bold">Suche</div>
                        <div className="text-lg">Produkte ohne Barcode</div>
                    </div>
                    <img src={searchIcon} alt="Search" className="block justify-self-end" />
                </div>
                {/* 3. Quantity */}
                <div className="grid grid-cols-[1fr_3fr_1fr] items-center">
                    <div></div>
                    <div>
                        <div className="text-2xl font-bold">Menge</div>
                        <div className="text-lg">anpassen</div>
                    </div>
                    <img src={quantityIcon} alt="Quantity" className="block justify-self-end" />
                </div>
                {/* 4. Membership */}
                <div className="grid grid-cols-[1fr_3fr_1fr] items-center">
                    <div></div>
                    <div>
                        <div className="text-2xl font-bold">Mitgliedsausweis</div>
                        <div className="text-lg">im Handy zeigen</div>
                    </div>
                    <img src={memberIcon} alt="Member" className="block justify-self-end" />
                </div>
                {/* 5. Pay */}
                <div className="grid grid-cols-[1fr_3fr_1fr] items-center">
                    <div></div>
                    <div>
                        <div className="text-2xl font-bold">Bezahle</div>
                        <div className="text-lg">mit deinem virtuellen Konto</div>
                    </div>
                    <img src={payIcon} alt="Pay" className="block justify-self-end" />
                </div>
            </div>
        </div>
    );
}