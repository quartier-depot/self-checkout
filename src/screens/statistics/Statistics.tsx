import React, { useState } from 'react';
import { useProducts } from '../../api/products/useProducts';

const NO_BARCODE_VALUE = 'KEIN BARCODE';

export const Statistics: React.FC = () => {
    const [showMissingBarcodes, setShowMissingBarcodes] = useState(false);

    const { data: products = [], isLoading, isError, error } = useProducts({
        refetchInterval: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <div>Loading products...</div>;
    }

    if (isError) {
        return <div>Error loading products: {error.message}</div>;
    }

    const totalProducts = products.length;

    // Calculate barcode statistics
    const noBarcode = products.filter(product => product.barcode === NO_BARCODE_VALUE).length;
    const hasValidBarcode = products.filter(product => product.barcode && product.barcode !== NO_BARCODE_VALUE).length;
    const productsWithoutBarcode = products.filter(product => !product.barcode);

    // Calculate percentages
    const noBarcodePercentage = (noBarcode / totalProducts * 100).toFixed(1);
    const hasValidBarcodePercentage = (hasValidBarcode / totalProducts * 100).toFixed(1);
    const missingBarcodePercentage = (productsWithoutBarcode.length / totalProducts * 100).toFixed(1);

    return (
        <div className={'p-4'}>
            <h1 className={'text-2xl font-bold mb-6'}>Statistik</h1>
            <div className={'space-y-6'}>
                <div className={'bg-slate-50 p-4 rounded-lg shadow'}>
                    <h2 className={'text-lg font-semibold mb-4'}>Total Produkte: {totalProducts}</h2>

                    {/* Visual Bar Chart */}
                    <div className={'mb-6'}>
                        <div className={'w-full h-8 flex rounded-lg overflow-hidden'}>

                            <div
                                className={'bg-emerald-500 h-full'}
                                style={{ width: `${hasValidBarcodePercentage}%` }}
                                title={`Mit Barcode: ${hasValidBarcodePercentage}%`}
                            />
                            <div
                                className={'bg-yellow-500 h-full'}
                                style={{ width: `${noBarcodePercentage}%` }}
                                title={`Ohne Barcode: ${noBarcodePercentage}%`}
                            />
                            <div
                                className={'bg-red-500 h-full'}
                                style={{ width: `${missingBarcodePercentage}%` }}
                                title={`Nicht erfasst: ${missingBarcodePercentage}%`}
                            />
                        </div>
                        <div className={'mt-4 flex flex-wrap gap-4'}>
                            <div className={'flex items-center'}>
                                <div className={'w-4 h-4 bg-emerald-500 rounded mr-2'} />
                                <span>Mit Barcode</span>
                            </div>
                            <div className={'flex items-center'}>
                                <div className={'w-4 h-4 bg-red-500 rounded mr-2'} />
                                <span>Ohne Barcode</span>
                            </div>
                            <div className={'flex items-center'}>
                                <div className={'w-4 h-4 bg-yellow-500 rounded mr-2'} />
                                <span>Nicht erfasst</span>
                            </div>
                        </div>
                    </div>

                    <div className={'space-y-4'}>
                        <div>
                            <h3 className={'font-medium'}>Produkte mit Barcode</h3>
                            <p className={'text-emerald-700'}>
                                {hasValidBarcode} Produkte ({hasValidBarcodePercentage}%)
                            </p>
                        </div>
                        <div>
                            <h3 className={'font-medium'}>Produkte ohne Barcode</h3>
                            <p className={'text-emerald-700'}>
                                {noBarcode} Produkte ({noBarcodePercentage}%)
                            </p>
                        </div>

                        <div>
                            <h3 className={'font-medium'}>Nicht erfasste Produkte</h3>
                            <p className={'text-emerald-700'}>
                                {productsWithoutBarcode.length} Produkte ({missingBarcodePercentage}%)
                            </p>
                        </div>
                    </div>
                </div>

                <div className={'bg-slate-50 p-4 rounded-lg shadow'}>
                    <button
                        onClick={() => setShowMissingBarcodes(!showMissingBarcodes)}
                        className={'w-full flex justify-between items-center text-left font-semibold text-lg mb-2'}
                    >
                        <span>Nicht erfasste Produkte: ({productsWithoutBarcode.length})</span>
                        <span className={'text-emerald-700'}>{showMissingBarcodes ? '▼' : '▶'}</span>
                    </button>
                    {showMissingBarcodes && (
                        <div className={'mt-4 space-y-2'}>
                            {productsWithoutBarcode.length === 0 ? (
                                <p className={'text-slate-500 italic'}>No products found without barcodes.</p>
                            ) : (
                                <div className={'grid gap-2'}>
                                    {productsWithoutBarcode.map(product => (
                                        <div key={product.id} className={'p-2 bg-slate-100 rounded'}>
                                            <div><span className={'font-medium'}>{product.artikel_id}</span> {product.name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 