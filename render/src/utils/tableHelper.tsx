import { ProColumnGroupType, ProColumnType } from '@ant-design/pro-table/lib/typing';
import { FormattedMessage } from 'react-intl';
import React from 'react';
import { ColumnsState } from '@ant-design/pro-table';

type renderType<T> = (dom: React.ReactNode, entity: T) => React.ReactNode;

type proColumn<T, ValueType> = ProColumnGroupType<T, ValueType> | ProColumnType<T, ValueType>;

class Column<T, ValueType> {
    private textId: string;
    render?: renderType<T>;
    show: boolean;
    search: boolean;
    readonly name: string;

    constructor(name: string, textId: string, show = true, search = true, render?: renderType<T>) {
        this.name = name;
        (this.show = show), (this.search = search);
        this.textId = textId;
        this.render = render;
    }

    toProColumn(): proColumn<T, ValueType> {
        return {
            key: this.name,
            title: <FormattedMessage id={this.textId} />,
            dataIndex: this.name,
            ellipsis: true,
            render: this.render,
        };
    }
}

export class TableHelper<T, ValueType = 'text'> {
    private columns: Record<string, Column<T, ValueType>> = {};

    addColumn(name: string, textId: string, show = true, search = true, render?: renderType<T>) {
        this.columns[name] = new Column<T, ValueType>(name, textId, show, search, render);
    }

    addAggregateColumn(
        name: string,
        textId: string,
        aggregator: (r: T) => string[],
        show = true,
        search = true,
    ) {
        this.columns[name] = new Column<T, ValueType>(name, textId, show, search, (_, record) => {
            return (
                <div
                    style={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                    }}
                >
                    {aggregator(record).join(', ')}
                </div>
            );
        });
    }

    addActionColumn() {
        this.columns['action'] = new Column<T, ValueType>('action', 'common.action', true, false);
    }

    addAction(render: renderType<T>) {
        this.columns['action'].render = render;
    }

    getColumnsStates(): Record<string, ColumnsState> {
        const result: Record<string, ColumnsState> = {};
        Object.keys(this.columns).forEach((c) => {
            result[c] = { show: this.columns[c].show };
        });
        return result;
    }

    setColumnsStates(columnsState: Record<string, ColumnsState>) {
        Object.keys(this.columns).forEach((c) => {
            if (columnsState[c]?.show === false) {
                this.columns[c].show = false;
            } else {
                this.columns[c].show = true;
            }
        });
    }

    getProColumns(): proColumn<T, ValueType>[] {
        const result: proColumn<T, ValueType>[] = [];
        Object.keys(this.columns).forEach((c) => result.push(this.columns[c].toProColumn()));
        return result;
    }

    getSearchColumns() {
        const result: string[] = [];
        Object.keys(this.columns)
            .filter((c) => this.columns[c].show && this.columns[c].search)
            .forEach((c) => result.push(c));
        return result;
    }
}
