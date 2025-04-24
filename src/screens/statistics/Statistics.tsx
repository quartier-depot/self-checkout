import React from 'react';
import { useProducts } from '../../api/products/useProducts';

export const Statistics: React.FC = () => {
    const productsQuery = useProducts();

    if (productsQuery.isLoading) {
        return <div>Loading products...</div>;
    }

    if (productsQuery.isError) {
        return <div>Error loading products: {productsQuery.error.message}</div>;
    }

    const products = productsQuery.data || [];
    const totalProducts = products.length;
    
    // Calculate barcode statistics
    const noBarcode = products.filter(product => product.barcode === 'KEIN BARCODE').length;
    const hasValidBarcode = products.filter(product => product.barcode && product.barcode !== 'KEIN BARCODE').length;
    const missingBarcode = products.filter(product => !product.barcode).length;

    // Calculate percentages
    const noBarcodePercentage = (noBarcode / totalProducts * 100).toFixed(1);
    const hasValidBarcodePercentage = (hasValidBarcode / totalProducts * 100).toFixed(1);
    const missingBarcodePercentage = (missingBarcode / totalProducts * 100).toFixed(1);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-6">Statistics</h1>
            <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg shadow">
                    <h2 className="text-lg font-semibold mb-4">Total Products: {totalProducts}</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium">Products with 'KEIN BARCODE'</h3>
                            <p className="text-emerald-700">
                                {noBarcode} products ({noBarcodePercentage}%)
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium">Products with valid barcode</h3>
                            <p className="text-emerald-700">
                                {hasValidBarcode} products ({hasValidBarcodePercentage}%)
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium">Products without barcode</h3>
                            <p className="text-emerald-700">
                                {missingBarcode} products ({missingBarcodePercentage}%)
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 