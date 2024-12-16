import * as React from 'react';
import AppComponentBase from '@src/components/Manager/AppComponentBase';
import { ImageProductDto } from '@src/services/services_autogen';
import { ViewLayout } from '..';
import ListFile from './ListFile';
import TableViewImage from './TableViewImage';

export interface Iprops {
    filesInside: ImageProductDto[];
    fileSelected: ImageProductDto;
    onAction: (action: number, item: ImageProductDto) => void;
    onSelectImage: (listItem: ImageProductDto[]) => void;
    viewLayout: number;
    handleScroll?: () => void;
}
export default class LayoutViewFolderAndFile extends AppComponentBase<Iprops> {
    render() {
        const { viewLayout, filesInside, fileSelected, onAction, onSelectImage } = this.props;
        return (
            <>
                {viewLayout === ViewLayout.Grid
                    ?
                    <ListFile
                        handleScroll={this.props.handleScroll}
                        onSelectImage={onSelectImage}
                        filesInside={filesInside}
                        fileSelected={fileSelected}
                        onAction={onAction}
                    />
                    :
                    <TableViewImage
                        handleScroll={this.props.handleScroll}
                        onSelectImage={onSelectImage}
                        filesInside={filesInside}
                        fileSelected={fileSelected}
                        onAction={onAction}
                    />
                }
            </>
        )
    }
}