import React, { useState } from 'react';
import { useGetProductsQuery } from '../../store/api/api';
import { Product } from '../../store/api/products/Product';

const NO_BARCODE_VALUE = 'KEIN BARCODE';

export const Statistics: React.FC = () => {
    const [showKnownUnknown, setShowKnownUnknown] = useState(false);
    const [showWithBarcode, setShowWithBarcode] = useState(false);
    const [showWithoutBarcode, setShowWithoutBarcode] = useState(false);

    const { data: products = [], isLoading, isError, error } = useGetProductsQuery(undefined, {
        pollingInterval: 5 * 60 * 1000,
    });

    if (isLoading) {
        return <div>Loading products...</div>;
    }

    if (isError) {
        return <div>Error loading products: {error.toString()}</div>;
    }

    const totalProducts = products.length;

    // Calculate barcode statistics
    const hasValidBarcode = products.filter((product: Product) => product.hasBarcodes);
    const noBarcode = products.filter(p => p.barcodes && p.barcodes.length > 0 && p.barcodes.includes(NO_BARCODE_VALUE));
    const unknownProducts = products.filter(p => p.barcodes && p.barcodes.length === 0);

    // Calculate percentages
    const hasValidBarcodePercentage = (hasValidBarcode.length / totalProducts * 100).toFixed(1);
    const noBarcodePercentage = (noBarcode.length / totalProducts * 100).toFixed(1);
    const unknownProductsPercentage = (unknownProducts.length / totalProducts * 100).toFixed(1);

    return (
        <div className={'p-4'}>
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
                                style={{ width: `${unknownProductsPercentage}%` }}
                                title={`Nicht erfasst: ${unknownProductsPercentage}%`}
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
                                {hasValidBarcode.length} Produkte ({hasValidBarcodePercentage}%)
                            </p>
                        </div>
                        <div>
                            <h3 className={'font-medium'}>Produkte ohne Barcode</h3>
                            <p className={'text-emerald-700'}>
                                {noBarcode.length} Produkte ({noBarcodePercentage}%)
                            </p>
                        </div>

                        <div>
                            <h3 className={'font-medium'}>Nicht erfasste Produkte</h3>
                            <p className={'text-emerald-700'}>
                                {unknownProducts.length} Produkte ({unknownProductsPercentage}%)
                            </p>
                        </div>
                    </div>
                </div>

                <div className={'bg-slate-50 p-4 rounded-lg shadow'}>
                    <button
                        onClick={() => setShowWithBarcode(!showWithBarcode)}
                        className={'w-full flex justify-between items-center text-left font-semibold text-lg mb-2'}
                    >
                        <span>Produkte mit Barcode: ({hasValidBarcode.length})</span>
                        <span className={'text-emerald-700'}>{showWithBarcode ? '▼' : '▶'}</span>
                    </button>
                    {showWithBarcode && (
                        <div className={'mt-4 space-y-2'}>
                            {hasValidBarcode.length === 0 ? (
                                <p className={'text-slate-500 italic'}>No products found without barcodes.</p>
                            ) : (
                                <div className={'grid gap-2'}>
                                    {hasValidBarcode.map(product => (
                                        <div key={product.id} className={'p-2 bg-slate-100 rounded'}>
                                            <div><span className={'font-medium'}>{product.artikel_id}</span> {product.name} {product.barcodes.join(', ')}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={'bg-slate-50 p-4 rounded-lg shadow'}>
                    <button
                        onClick={() => setShowWithoutBarcode(!showWithoutBarcode)}
                        className={'w-full flex justify-between items-center text-left font-semibold text-lg mb-2'}
                    >
                        <span>Produkte ohne Barcode: ({noBarcode.length})</span>
                        <span className={'text-emerald-700'}>{showWithoutBarcode ? '▼' : '▶'}</span>
                    </button>
                    {showWithoutBarcode && (
                        <div className={'mt-4 space-y-2'}>
                            {noBarcode.length === 0 ? (
                                <p className={'text-slate-500 italic'}>No products found without barcodes.</p>
                            ) : (
                                <div className={'grid gap-2'}>
                                    {noBarcode.map(product => (
                                        <div key={product.id} className={'p-2 bg-slate-100 rounded'}>
                                            <div><span className={'font-medium'}>{product.artikel_id}</span> {product.name}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={'bg-slate-50 p-4 rounded-lg shadow'}>
                    <button
                        onClick={() => setShowKnownUnknown(!showKnownUnknown)}
                        className={'w-full flex justify-between items-center text-left font-semibold text-lg mb-2'}
                    >
                        <span>Nicht erfasste Produkte: ({unknownProducts.length})</span>
                        <span className={'text-emerald-700'}>{showKnownUnknown ? '▼' : '▶'}</span>
                    </button>
                    {showKnownUnknown && (
                        <div className={'mt-4 space-y-2'}>
                            {unknownProducts.length === 0 ? (
                                <p className={'text-slate-500 italic'}>No products found without barcodes.</p>
                            ) : (
                                <div className={'grid gap-2'}>
                                    {unknownProducts.map(product => (
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