import React, {Component} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {withOnyx} from 'react-native-onyx';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import ReportView from './report/ReportView';
import ONYXKEYS from '../../ONYXKEYS';
import styles, {getSafeAreaPadding} from '../../styles/styles';
import compose from '../../libs/compose';
import withWindowDimensions from '../../components/withWindowDimensions';
import HeaderView from './HeaderView';
import CustomStatusBar from '../../components/CustomStatusBar';
import Navigator from '../../Navigator';

const propTypes = {
    /* Onyx Props */
    // List of reports to display
    reports: PropTypes.objectOf(PropTypes.shape({
        reportID: PropTypes.number,
    })),

    // ID of Report being viewed
    currentlyViewedReportID: PropTypes.string,
};

const defaultProps = {
    reports: {},
    currentlyViewedReportID: '',
};

class MainView extends Component {
    render() {
        let activeReportID = parseInt(this.props.currentlyViewedReportID, 10);

        // The styles for each of our reports. Basically, they are all hidden except for the one matching the
        // reportID in the URL
        const reportStyles = _.reduce(this.props.reports, (memo, report) => {
            const isActiveReport = activeReportID === report.reportID;
            const finalData = {...memo};
            let reportStyle;

            if (isActiveReport) {
                activeReportID = report.reportID;
                reportStyle = [styles.dFlex, styles.flex1];
            } else {
                reportStyle = [styles.dNone];
            }

            finalData[report.reportID] = [reportStyle];
            return finalData;
        }, {});

        const reportsToDisplay = _.filter(this.props.reports, report => (
            report.isPinned
                || report.unreadActionCount > 0
                || report.reportID === activeReportID
        ));
        return (
            <>
                <CustomStatusBar />
                <SafeAreaInsetsContext.Consumer style={[styles.flex1]}>
                    {insets => (
                        <View
                            style={[styles.appContentWrapper,
                                styles.flexColumn,
                                styles.flex1,
                                getSafeAreaPadding(insets),
                            ]}
                        >
                            <HeaderView
                                shouldShowNavigationMenuButton={this.props.isSmallScreenWidth}
                                onNavigationMenuButtonClicked={() => {
                                    Navigator.navigate('/');
                                }}
                                reportID={this.props.currentlyViewedReportID}
                            />
                            {_.map(reportsToDisplay, report => (
                                <View
                                    key={report.reportID}
                                    style={reportStyles[report.reportID]}
                                >
                                    <ReportView
                                        reportID={report.reportID}
                                        isActiveReport={report.reportID === activeReportID}
                                    />
                                </View>
                            ))}
                        </View>
                    )}
                </SafeAreaInsetsContext.Consumer>
            </>
        );
    }
}

MainView.propTypes = propTypes;
MainView.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withOnyx({
        reports: {
            key: ONYXKEYS.COLLECTION.REPORT,
        },
        currentURL: {
            key: ONYXKEYS.CURRENT_URL,
        },
        currentlyViewedReportID: {
            key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
        },
    }),
)(MainView);
