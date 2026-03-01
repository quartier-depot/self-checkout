import { EmptySearch } from './EmptySearch';
import { Instructions } from './Instructions';
import { ProductDisplayItem } from './ProductDisplayItem.tsx';
import { Menu } from './menu/Menu';
import { useAppSelector } from '../../../store/store';
import Scrollbar from '../../../components/scrollbar/Scrollbar';
import { DisplayItemType, selectFilteredDisplayItems } from '../../../store/slices/displaySlice.ts';
import { CategoryDisplayItem } from './CategoryDisplayItem.tsx';
import { ListDisplayItem } from './ListDisplayItem.tsx';

export function Display() {
    const displayItems = useAppSelector(selectFilteredDisplayItems);

    return (
        <>
            <Menu />
            {displayItems === undefined && <Instructions />}
            {displayItems && displayItems.length === 0 && <EmptySearch />}
            {displayItems && displayItems.length > 0 && (
            <Scrollbar scrollPositionAfterUpdate={'top'}>
                <div className={'grid grid-cols-2 gap-2P'}>
                    {displayItems.map((displayItem: DisplayItemType) => {
                      switch (displayItem.type) {
                        case 'product':
                          return (<ProductDisplayItem
                            key={displayItem.key}
                            product={displayItem.product}
                            quantity={displayItem.quantity}
                          />)
                        
                        case 'category':
                          return (<CategoryDisplayItem
                            key={displayItem.key}
                            category={displayItem.key}
                          />)

                      case 'list':
                          return (<ListDisplayItem
                                  key={displayItem.key}
                                  title={displayItem.title}
                                  delivery={displayItem.delivery}
                          />)
                      }
                    }
                    )}
                </div>
            </Scrollbar>
            )}
        </>
    );
}
