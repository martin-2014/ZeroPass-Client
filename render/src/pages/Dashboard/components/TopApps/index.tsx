import { FC } from 'react';
import { RangeValue } from 'rc-picker/lib/interface';
import { Row, Col, Empty, DatePicker, Typography, Avatar } from 'antd';
import { useState, useEffect } from 'react';
import { Column } from '@ant-design/charts';
import { getTopAppEntris } from '@/services/api/dashboard';
import { FormattedMessage, useModel } from 'umi';
import moment from 'moment';
import BaseCard from '../BaseCard';
import { getLocalTimeZone } from '@/hooks/useLocalTime';

const { RangePicker } = DatePicker;
const { Text, Title } = Typography;

interface RecordItem {
    appEntry: string;
    visitedCount: number;
}

const TopApps: FC = () => {
    const [loading, setLoading] = useState(true);
    const [datas, setData] = useState<RecordItem[]>([]);
    const [dateRange, setDaterange] = useState<RangeValue<moment.Moment>>([
        moment().subtract(6, 'days'),
        moment(),
    ]);
    const [winHeight, setWinHeight] = useState(document.body.clientHeight);
    const { initialState } = useModel('@@initialState');

    const resizeHeight = () => {
        setWinHeight(document.body.clientHeight);
    };

    const getData = async (begin: moment.Moment, end: moment.Moment) => {
        const endStr = end
            .clone()
            .utc()
            .add(1, 'days')
            .zone(getLocalTimeZone())
            .format('YYYY-MM-DD');
        const beginStr = begin.utc().zone(getLocalTimeZone()).format('YYYY-MM-DD');
        const res = await getTopAppEntris({ top: 5, beginDate: beginStr, endDate: endStr });
        if (!res.fail) {
            setData(res.payload);
        }
    };

    const initData = async () => {
        await getData(dateRange?.[0]!, dateRange?.[1]!);
        setLoading(false);
    };

    useEffect(() => {
        initData();
        window.addEventListener('resize', resizeHeight);
        return () => {
            window.removeEventListener('resize', resizeHeight);
        };
    }, []);

    const getHeight = () => {
        return (winHeight - 200) * 0.5 - 50;
    };
    const config = {
        xAxis: {
            label: {
                autoHide: false,
                autoEllipsis: true,
            },
            grid: null,
        },
        yAxis: {
            grid: {
                line: {
                    style: {
                        stroke: '#a9a9a9',
                        lineWidth: 0.5,
                        strokeOpacity: 0.3,
                    },
                },
            },
        },
        columnStyle: {
            fill: 'l(90) 0:#41e9bf 1:#006cff',
        },
        xField: 'appEntry',
        yField: 'visitedCount',
        maxColumnWidth: 30,
    };

    const SetDateRange = async (unit: moment.unitOfTime.DurationConstructor) => {
        const begin = moment().subtract(1, unit).add(1, 'days');
        const end = moment();
        setDaterange([begin, end]);
        await getData(begin, end);
    };

    const DateRangeChange = async (range: RangeValue<moment.Moment>, _: [string, string]) => {
        const begin = range?.[0] || null;
        const end = range?.[1] || null;
        setDaterange([begin, end]);
        if (begin && end) {
            await getData(begin, end);
        }
    };

    const getButton = (type: moment.unitOfTime.DurationConstructor, text: JSX.Element) => {
        return (
            <span style={{ cursor: 'pointer', margin: '0 8px' }} onClick={() => SetDateRange(type)}>
                {text}
            </span>
        );
    };

    const dateFormat = 'YYYY/MM/DD';
    return (
        <BaseCard
            radius={8}
            title={{
                height: 20,
                text: (
                    <div>
                        <FormattedMessage id="overview.top.appUsed" />
                        <span>(Top 5)</span>
                    </div>
                ),
            }}
            suf={
                <div>
                    {getButton('days', <FormattedMessage id="overview.top.today" />)}
                    {getButton('weeks', <FormattedMessage id="overview.top.week" />)}
                    {getButton('months', <FormattedMessage id="overview.top.month" />)}
                    {getButton('years', <FormattedMessage id="overview.top.year" />)}
                    <RangePicker
                        size="small"
                        format={dateFormat}
                        value={dateRange}
                        onChange={DateRangeChange}
                        allowClear={false}
                    />
                </div>
            }
            loading={loading}
        >
            <Row style={{ height: '100%' }}>
                <Col span={16} style={{ height: '100%' }}>
                    <div style={{ height: '100%', display: 'flex', paddingBottom: 10 }}>
                        {datas.length ? (
                            <div
                                style={{
                                    height: getHeight(),
                                    width: '100%',
                                    margin: 'auto',
                                    padding: '5px 10px',
                                }}
                            >
                                <Column {...config} data={datas} />
                            </div>
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </div>
                </Col>
                <Col span={1}></Col>
                <Col span={7}>
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <div style={{ fontSize: 14, margin: '10px 0', flex: '0.1' }}>
                            <FormattedMessage id="overview.top.appView" />
                        </div>
                        {datas.map((item, index) => {
                            return (
                                <div style={{ flex: '0.15' }} key={index}>
                                    <Row style={{ fontSize: 13 }}>
                                        <Col style={{}} span={3}>
                                            <Avatar
                                                size={16}
                                                style={{ backgroundColor: '#059dfe' }}
                                            >
                                                {index + 1}
                                            </Avatar>
                                        </Col>
                                        <Col span={18}>
                                            <Text
                                                ellipsis={{ tooltip: item.appEntry }}
                                                style={{ width: '90%' }}
                                            >
                                                {item.appEntry}
                                            </Text>
                                        </Col>
                                        <Col span={3}>{item.visitedCount}</Col>
                                    </Row>
                                </div>
                            );
                        })}
                    </div>
                </Col>
            </Row>
        </BaseCard>
    );
};

export default TopApps;
