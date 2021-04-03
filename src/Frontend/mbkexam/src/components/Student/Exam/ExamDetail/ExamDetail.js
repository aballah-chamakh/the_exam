import React from 'react';
import { HOST_URL, formatDateTime } from '../../../../config';
import ChartJS from '../../../Chart/Chart';
import ResultModal from "./ResultModal/ResultModal";
import axios from 'axios';
import { withRouter } from "react-router-dom";
import $ from 'jquery';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import ExamResult from './ExamResult/ExamResult';
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import './examdetail-scss.scss';
import SyncLoader from "react-spinners/SyncLoader";
import jwt_decode from "jwt-decode";


class ExamDetail extends React.Component {
    state = {
        exam: null,
        fileCertificate: {
            file: null,
            filename: "",
        },
        form: {
            score: 0,
            note: "",
        },
        data: {
            datasets: [
                {
                    label: "Cumulitive pnl",
                    data: [],
                    fill: false,
                    borderColor: "#34495E"
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: true,
                text: "Cumulative pnl ($) over time"
            },
            scales: {
                xAxes: [{
                    type: "time",
                    time: {
                        format: "DD/MM/YYYY",
                        tooltipFormat: 'll',
                        unit: "day",
                        displayFormats: {
                            day: 'll'
                        },
                        stepSize: 1,
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Dates'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Cumulative pnl ($)'
                    }
                }]
            }
        },
        certified: false,
        resultModalVisibility: false,
        startDateTrade: null,
        endDateTrade: null,
        startDateAnalysis: null,
        endDateAnalysis: null,
        filteredTrades: [],
        filteredAnalysis: [],
        submitButtonElement: null,
        loaded: false,
        error404: false,
        tradingKpis: [

        ]
    }
    validationSchema = Yup.object().shape({

        score: Yup.number().required(),
        note: Yup.string().required(),
    })
    componentDidUpdate(prevProps) {
        let source = this.props.source;
        if (this.props.match.params.exam_slug !== prevProps.match.params.exam_slug && source != "admin") {
            window.scrollTo(0, 0)
            let notif = this.props.location.state;
            let student_notif = false;
            let admin_notif = false;
            if (notif) {
                student_notif = this.props.location.state.student_notif;
                admin_notif = this.props.location.state.admin_notif;
                if (!student_notif) {
                    student_notif = false
                }
                if (!admin_notif) {
                    admin_notif = false
                }
            }
            let studentprofile_slug = this.props.match.params.studentprofile_slug
            let exam_slug = this.props.match.params.exam_slug;
            let token = localStorage.getItem('token')
            let config = { headers: { Authorization: 'Bearer ' + token } }
            let decodedToken = jwt_decode(token)
            let tokenIsExpired = Date.now() >= decodedToken.exp
            if (tokenIsExpired) {
                this.refreshToken(exam_slug, false)
            } else {
                this.loadExamDetail(exam_slug, config)
            }
            this.interval = setInterval(
                () => {
                    if (tokenIsExpired) {
                        this.refreshToken(exam_slug, true)
                    } else {
                        this.reloadExamDetail(exam_slug, config)
                    }
                }
                , 5000);

        }
    }
    componentDidMount() {
        window.scrollTo(0, 0)
        let studentprofile_slug = this.props.match.params.studentprofile_slug
        let exam_slug = this.props.match.params.exam_slug;
        let token = localStorage.getItem('token')
        let config = { headers: { Authorization: 'Bearer ' + token } }
        let decodedToken = jwt_decode(token)
        let tokenIsExpired = Date.now() >= decodedToken.exp * 1000;
        if (tokenIsExpired) {
            this.refreshToken(exam_slug, false)
        } else {
            this.loadExamDetail(exam_slug, config)
        }
        this.interval = setInterval(
            () => {
                token = localStorage.getItem('token')
                let config = { headers: { Authorization: 'Bearer ' + token } }
                decodedToken = jwt_decode(token)
                tokenIsExpired = Date.now() >= decodedToken.exp * 1000;
                if (tokenIsExpired) {
                    this.refreshToken(exam_slug, true)

                } else {
                    this.reloadExamDetail(exam_slug, config)
                }
            }
            , 5000);


    }
    refreshToken = (exam_slug, reload) => {
        let refreshToken = localStorage.getItem("refresh_token")
        let data = { 'refresh': refreshToken }
        axios.post(HOST_URL + "/api/token/refresh/", data).then(res => {
            let token = res.data.access;
            refreshToken = res.data.refresh;
            localStorage.setItem('token', token)
            localStorage.setItem('refresh_token', refreshToken)
            let config = { headers: { Authorization: 'Bearer ' + token } }
            if (reload) {
                this.reloadExamDetail(exam_slug, config)
            } else {
                this.loadExamDetail(exam_slug, config)
            }
        })
    }
    reloadExamDetail = (exam_slug, config) => {
        axios.get(HOST_URL + "/api/exam/" + exam_slug + "/", config).then(res => {
            let exam = res.data
            console.log(exam)
            console.log(exam.content)
            this.filter("trade", exam.content)
            this.filter("analysis", exam.content)
            this.setState({
                exam: exam,
                loaded: true,
                fileCertificate: {
                    file: null,
                    filename: exam.certificate_filename,
                    fileurl: exam.certificate_url,
                },
            })
            if ((exam.status != "on going" && this.props.source == "admin") || (exam.status == "succeeded" || exam.status == "failed")) {
                clearInterval(this.interval)
            }
        }).catch(err => {
            this.setState({ error404: true, loaded: false })
        })
    }
    loadExamDetail = (exam_slug, config) => {
        axios.get(HOST_URL + "/api/exam/" + exam_slug + "/", config).then(res => {
            let exam = res.data
            if (exam.status == "succeeded" || exam.status == "failed") {
                $(".result-score-input").blur();
            }
            this.setState({
                loaded: true,
                exam: exam, certified: exam.certified
                , form: { note: exam.note, score: exam.score },
                fileCertificate: {
                    file: null,
                    filename: exam.certificate_filename,
                    fileurl: exam.certificate_url,
                },
                startDateAnalysis: exam.start_at,
                endDateAnalysis: exam.end_at,
                startDateTrade: exam.start_at,
                endDateTrade: exam.end_at,
                filteredTrades: exam.content,
                filteredAnalysis: exam.content
            })
            this.getAnalysisKpis(exam.content)
        }).catch(err => {
            this.setState({ error404: true, loaded: false })
        })
    }
    componentWillUnmount = () => {
        clearInterval(this.interval)
    }
    toggleExecutions = (trade_id) => {
        $('.select-trade-item-content' + trade_id).toggle(200)
    }
    handleSubmit = (resultData, { setSubmitting, resetForm, setFieldValue }) => {
        console.log(resultData)
        setSubmitting(false)
        let certified = this.state.exam.certified;
        let fileCertificate = this.state.fileCertificate.file
        if (certified && !fileCertificate) {
            this.props.openAlert()
            $(".examdetail-result-error").css('display', 'flex')
        } else {
            let exam_slug = this.props.match.params.exam_slug;
            let form = new FormData()
            form.append('note', resultData['note'])
            form.append('score', resultData['score'])
            form.append('certificate', fileCertificate)
            let token = localStorage.getItem('token')
            let config = { headers: { Authorization: 'Bearer ' + token } }
            axios.put(HOST_URL + "/api/exam/" + exam_slug + "/set_result/", form, config).then(res => {
                window.scrollTo(0, 0)
                let exam = res.data
                this.setState({
                    exam: exam,
                    fileCertificate: {
                        file: null,
                        filename: exam.certificate_filename,
                        fileurl: exam.certificate_url,
                    }
                })
            })
        }
    }
    getTradesInRange = (start_datetime, end_datetime, new_trades) => {
        let trades = [];
        if (new_trades && new_trades.length > 0) {
            trades = new_trades;
        } else {
            trades = this.state.exam.content;
        }
        if (trades.length == 0) {
            return []
        } else {
            let tradesInRange = [];
            let start_datetimex = new Date(start_datetime)
            let end_datetimex = new Date(end_datetime)
            for (let i = 0; i < trades.length; i++) {
                let currentDate = new Date(trades[i]['entry_datetime'])
                if (currentDate >= start_datetimex && currentDate <= end_datetimex) {
                    tradesInRange.push(trades[i])
                }
            }
            return tradesInRange
        }
    }
    filter = (type, new_trades) => {
        console.log(" ======================== handling tader filter ==================")
        if (type == "trade") { // for normale trades 
            console.log("handling normal trades !! ")
            let startDate = this.state.startDateTrade;
            let endDate = this.state.endDateTrade;
            let tradesInRange = this.getTradesInRange(startDate, endDate, new_trades)
            if (tradesInRange != this.state.filteredTrades) {
                console.log("handling normal trades ! =========================================================== ! ")
                this.setState({ filteredTrades: this.getTradesInRange(startDate, endDate, new_trades) });
            }
        } else { // for analysis and the chart 
            console.log("handling chart and analysis !! ")
            let startDate = this.state.startDateAnalysis;
            let endDate = this.state.endDateAnalysis;
            let tradesInRange = this.getTradesInRange(startDate, endDate, new_trades)
            if (tradesInRange != this.state.filteredAnalysis) {
                console.log("handling chart and analysis ! =========================================================== ! ")
                this.setState({ filteredAnalysis: this.getTradesInRange(startDate, endDate, new_trades) });
                this.getAnalysisKpis(this.getTradesInRange(startDate, endDate))
            }
        }
    }
    triggerCertificateUpload = (inpFile) => {
        this.props.closeAlert()
        inpFile.click()
    }
    handleCertificateUpload = (e) => {
        let file = e.target.files[0];
        if (!file) {
            return
        }
        let filename = file.name;
        this.setState({
            fileCertificate: {
                filename: filename,
                file: file
            }
        })
    }
    submitExamResult = () => {
        this.state.submitButtonElement.click();
    }
    handleResultModalClose = () => {
        this.setState({ resultModalVisibility: false })
    }
    handlResutlModalYes = () => {
        this.setState({ resultModalVisibility: false })
        this.submitExamResult()
    }
    openResultModal = (submitButtonElement) => {
        this.setState({ resultModalVisibility: true, submitButtonElement: submitButtonElement })
    }
    handlestartDateTrade = (datetime) => {
        this.setState({ startDateTrade: datetime })
    }
    handleendDateTrade = (datetime) => {
        this.setState({ endDateTrade: datetime })
    }
    handlestartDateAnalysis = (datetime) => {
        this.setState({ startDateAnalysis: datetime })
    }
    handleendDateAnalysis = (datetime) => {
        this.setState({ endDateAnalysis: datetime })
    }
    updateCertified = (val) => {
        let exam = this.state.exam
        exam.certified = val
        this.setState({ exam: exam })
    }
    formatDatetime = (date) => {

        let formattedDate = date.getDate() + "/";
        formattedDate += date.getMonth() + 1 + "/";
        formattedDate += date.getFullYear();
        return formattedDate
    }
    sameDay = (current_date, next_date) => {
        return current_date.getDate() == next_date.getDate() && current_date.getMonth() == next_date.getMonth() && current_date.getFullYear() == next_date.getFullYear()
    }
    getAnalysisTradesData = () => {
        let trades = this.state.filteredAnalysis
        let chartData = this.state.data;
        if (!trades || trades.length == 0) {
            return chartData;
        }
        let newTrades = [];
        let newLabels = [];
        let currentPnl = 0;
        if (trades.length == 1) {
            let current_date = new Date(trades[0]['entry_datetime'])
            newTrades = [{ x: current_date, y: parseFloat(trades[0]['pnl']) },]
        } else {
            for (let i = trades.length - 1; i >= 0; i--) {

                let current_date = new Date(trades[i]['entry_datetime'])
                currentPnl += parseFloat(trades[i]['pnl'])
                if (i == 0) {
                    newTrades.push({
                        x: current_date,
                        y: currentPnl
                    })
                    break;
                }
                let next_date = new Date(trades[i - 1]['entry_datetime'])
                if (!this.sameDay(current_date, next_date)) {
                    newTrades.push({
                        x: current_date,
                        y: currentPnl
                    })

                }
            }
        }
        chartData['datasets'] = [{ ...chartData['datasets'][0], data: newTrades },];
        return chartData;
    }
    getAnalysisKpis = (filteredAnalysis) => {
        console.log('getAnalysisKpis !!')
        let winningTradesValues = 0;
        let losingTradesValues = 0;
        let nbOfLosingTrades = 0;
        let nbOfWinningTrades = 0;
        let filteredAnalysisLen = filteredAnalysis.length;
        for (let i = 0; i < filteredAnalysisLen; i++) {
            let currentPnl = parseInt(filteredAnalysis[i]['pnl'])
            if (currentPnl > 0) {
                nbOfWinningTrades += 1;
                winningTradesValues += currentPnl;
            } else if (currentPnl < 0) {
                nbOfLosingTrades += 1;
                losingTradesValues += currentPnl;
            }
        }
        let avgWinningTradeValue = winningTradesValues / nbOfWinningTrades;
        let avgLosingTradeValue = losingTradesValues / nbOfLosingTrades;
        let winningRate = (nbOfWinningTrades / filteredAnalysisLen) * 100;
        let losingRate = (nbOfLosingTrades / filteredAnalysisLen) * 100;
        let expectancy = winningRate * avgWinningTradeValue - losingRate * avgLosingTradeValue;
        let win_loss_ratio = avgWinningTradeValue / avgLosingTradeValue;
        let newAnalysisKpis = [
            { title: "winning rate", nb: !isNaN(winningRate).toFixed(2) ? winningRate + '%' : '0%' },
            { title: "loss rate", nb: !isNaN(losingRate).toFixed(2) ? losingRate + '%' : '0%' },
            { title: "value of a winning trade", nb: !isNaN(avgWinningTradeValue) ? avgWinningTradeValue.toFixed(2) + '$' : '0$' },
            { title: "value of a losing trade", nb: !isNaN(avgLosingTradeValue) ? avgLosingTradeValue.toFixed(2) + '$' : '0$' },
            { title: "ratio win/loss", nb: !isNaN(win_loss_ratio) ? win_loss_ratio + '%' : win_loss_ratio },
            { title: "# of winning trades", nb: nbOfWinningTrades },
            { title: "# of losing trades", nb: nbOfLosingTrades },
            { title: "expectancy", nb: !isNaN(expectancy) ? expectancy + '$' : '0$' }
        ]
        console.log('pre trading kpis !!')
        console.log(newAnalysisKpis)
        this.setState({ tradingKpis: newAnalysisKpis })
    }
    formatNbDollarSign = (nb) => {
        if (nb != 0) {
            return nb + '$';
        }
        return nb;
    }
    render() {
        let fileCertificate = this.state.fileCertificate;
        let exam = this.state.exam
        let source = this.props.source;
        let any = this.props.any;
        let resultModalVisibility = this.state.resultModalVisibility
        let startDateTrade = this.state.startDateTrade
        let endDateTrade = this.state.endDateTrade
        let startDateAnalysis = this.state.startDateAnalysis
        let endDateAnalysis = this.state.endDateAnalysis
        let tradingKpis = this.state.tradingKpis
        let filteredTrades = this.state.filteredTrades;
        let loaded = this.state.loaded;
        console.log('trading kpi !!')
        console.log(tradingKpis)
        return (
            <div class="exam-detail-container" >
                {resultModalVisibility ?
                    <ResultModal resutlModalVisibility={this.state.resutlModalVisibility} handleResultModalClose={this.handleResultModalClose} handlResutlModalYes={this.handlResutlModalYes} />
                    : null}
                {exam ?
                    <div class="exam-detail-content">
                        <div class="exam-detail-info">
                            <div class="exam-detail-info-header">
                                <p>info</p>
                                <hr />
                            </div>
                            <div class="exam-detail-info-content" >
                                <div class="form-group">
                                    <label for="examNamex">name</label>
                                    <input type="text" readonly class="form-control" id="examNamex" value={exam.name} />
                                </div>
                                <div class="form-group">
                                    <label for="examStatus">status</label>
                                    <input type="text" readonly class="form-control" id="examStatus" value={exam.status} />
                                </div>
                                <div class="form-group">
                                    <label for="examStartAt">start_at</label>
                                    <input type="text" readonly class="form-control" id="examStartAt" value={formatDateTime(exam.start_at)} />
                                </div>
                                <div class="form-group">
                                    <label for="examEndAt">end_at</label>
                                    <input type="text" readonly class="form-control" id="examEndAt" value={formatDateTime(exam.end_at)} />
                                </div>
                                <div class="form-group">
                                    <label for="examInitialBalance">initial balance</label>
                                    <input type="text" readonly class="form-control" id="examInitialBalance" value={this.formatNbDollarSign(exam.initial_balance)} />
                                </div>
                                <div class="form-group">
                                    <label for="examCurrentBalance">current balance</label>
                                    <input type="text" readonly class="form-control" id="examCurrentBalance" value={this.formatNbDollarSign(exam.current_balance)} />
                                </div>
                                <div class="form-group">
                                    <label for="examCurrentPnl">current pnl</label>
                                    <input type="text" readonly class="form-control" id="examCurrentPnl" value={this.formatNbDollarSign(exam.current_pnl)} />
                                </div>
                            </div>
                        </div>
                        <div class="exam-detail-analysis">
                            <div class="exam-detail-analysis-header">
                                <p>analysis</p>
                            </div>
                            <div class="exam-detail-analysis-content" >
                                <div class="exam-detail-analysis-content-filter">
                                    <div class="exam-detail-analysis-content-filter-header">
                                        <p>filter</p>
                                    </div>
                                    <div class="exam-detail-analysis-content-filter-content">
                                        <DatePicker
                                            label="start date"
                                            value={startDateAnalysis}
                                            format="dd/MM/yyyy"
                                            onChange={this.handlestartDateAnalysis}
                                            minDate={exam.start_at}
                                            maxDate={exam.end_at}
                                            animateYearScrolling
                                        />
                                        <DatePicker
                                            label="end date"
                                            value={endDateAnalysis}
                                            format="dd/MM/yyyy"
                                            onChange={this.handleendDateAnalysis}
                                            minDate={startDateAnalysis}
                                            maxDate={exam.end_at}
                                            animateYearScrolling
                                        />

                                    </div>
                                </div>
                                <div class="exam-detail-analysis-content-kpis">
                                    <div class="exam-detail-analysis-content-kpis-header">
                                        <p>kpis</p>
                                    </div>
                                    <div class="exam-detail-analysis-content-kpis-content">
                                        {tradingKpis.map(kpi => {
                                            return (
                                                <div key={kpi.id} class="exam-detail-analysis-content-kpis-content-item">
                                                    <span class="exam-detail-analysis-content-kpis-content-item-title">{kpi.title}</span>
                                                    <span class="exam-detail-analysis-content-kpis-content-item-nb">{kpi.nb}</span>
                                                </div>
                                            )
                                        })
                                        }
                                    </div>
                                </div>
                                <div class="exam-detail-analysis-content-data">
                                    <div class="exam-detail-analysis-content-data-header">
                                        <p>cumulative pnl </p>
                                    </div>
                                    <div class="exam-detail-analysis-content-data-content">
                                        <ChartJS type="line" data={this.getAnalysisTradesData()} options={this.state.options} height="500px" width="100%" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="exam-detail-trades">
                            <div class="exam-detail-trades-header">
                                <p>Trades</p>
                            </div>
                            <div class="exam-detail-trades-content">
                                <div class="exam-detail-trades-content-filter">
                                    <div class="exam-detail-trades-content-filter-header">
                                        <p>filter</p>
                                    </div>
                                    <div class="exam-detail-trades-content-filter-content">

                                        <DatePicker

                                            label="start date"
                                            value={startDateTrade}
                                            format="dd/MM/yyyy"
                                            onChange={this.handlestartDateTrade}
                                            minDate={exam.start_at}
                                            maxDate={exam.end_at}
                                            animateYearScrolling
                                        />
                                        <DatePicker

                                            label="end date"
                                            value={endDateTrade}
                                            format="dd/MM/yyyy"
                                            onChange={this.handleendDateTrade}
                                            minDate={startDateTrade}
                                            maxDate={exam.end_at}
                                            animateYearScrolling
                                        />
                                    </div>
                                </div>
                                <div class="exam-detail-trades-content-data">
                                    <div class="exam-detail-trades-content-data-header">
                                        <p>trade list</p>
                                    </div>
                                    <div class="exam-detail-trades-content-data-content" >
                                        {filteredTrades.map(trade => {
                                            return (
                                                <div key={trade.id} class="trade-item">
                                                    <div class="trade-item-header">
                                                        <span class="trade-item-data-market">{trade.instrument}</span>
                                                        <span class="trade-item-data-datetime">
                                                            <div style={{ marginBottom: "10px" }} >entry : {formatDateTime(trade.entry_datetime)}</div>
                                                            <div>exit : {formatDateTime(trade.exit_datetime)}</div>
                                                        </span>
                                                        <span class="trade-item-data-sell">{trade.action}</span>
                                                        <span class="trade-item-data-entry">entry : {parseFloat(trade.entry_price).toString() + '$'}</span>
                                                        <span class="trade-item-data-exit">exit : {parseFloat(trade.exit_price).toString() + '$'}</span>
                                                        <span class="trade-item-data-profit">{parseFloat(trade.pnl).toString() + "$"}</span>
                                                        <button onClick={() => { this.toggleExecutions(trade.id) }} ><i class='far fa-arrow-alt-circle-down'></i></button>
                                                    </div>
                                                    <div class={"trade-item-content select-trade-item-content" + trade.id}>
                                                        <div class="execution-header">
                                                            <i class="material-icons">subdirectory_arrow_right</i>
                                                            <p>Executions</p>
                                                        </div>
                                                        <div class="execution-content">
                                                            <table class="table">
                                                                <thead>
                                                                    <tr>
                                                                        <th scope="col">action</th>
                                                                        <th scope="col">quantity</th>
                                                                        <th scope="col">price</th>
                                                                        <th scope="col">datetime</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {trade.executions.map(execution => {
                                                                        return (
                                                                            <tr key={execution.id}>
                                                                                <td>{execution.action}</td>
                                                                                <td>{execution.quantity}</td>
                                                                                <td>{parseFloat(execution.price).toString() + '$'}</td>
                                                                                <td>{formatDateTime(execution.datetime)}</td>
                                                                                {console.log("datetime =======================================================> " + execution.datetime)}
                                                                            </tr>
                                                                        )
                                                                    })
                                                                    }
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}</div>

                                </div>
                            </div>

                        </div>

                        <ExamResult fileCertificate={this.state.fileCertificate}
                            source={this.props.source}
                            triggerCertificateUpload={this.triggerCertificateUpload}
                            handleCertificateUpload={this.handleCertificateUpload}
                            handleSubmit={this.handleSubmit}
                            form={this.state.form}
                            validationSchema={this.validationSchema}
                            exam={this.state.exam}
                            updateCertified={this.updateCertified}
                            openResultModal={this.openResultModal}
                        />


                    </div>
                    : !loaded ?
                        <div style={{ height: "100vh", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                            <SyncLoader color={"#283747"} size={10} loading={true} />
                        </div>
                        : null}
            </div>
        )
    }
}
export default withRouter(ExamDetail);
