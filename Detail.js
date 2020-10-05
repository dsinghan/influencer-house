import React, { useEffect, useState, useRef, createRef } from 'react';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import { Typography, Divider, Button, Chip } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import CreateIcon from '@material-ui/icons/Create';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import { Container } from './../../../components';
import { PRIMARY_COLOR } from './../../../constants';
import { UserAPI, UserSocialProfileAPI, UserPeriodAPI, MobileAppTagAPI } from './../../../api';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
}));

export default function Detail() {
    const { id } = useParams();
    const history = useHistory();
    const location = useLocation();
    const profilePictureUploader = createRef();
    const coverImageUploader = createRef();

    const classes = useStyles();

    const [userData, setUserData] = useState({ userDetail: {} });
    const [userFollowingData, setUserFollowingData] = useState([]);
    const [userFollowers, setUserFollowers] = useState([]);
    const [socialProfiles, setSocialProfils] = useState({});
    const [period, setPeriod] = useState([]);
    const [tag, setTag] = useState([]);
    const [socialProfileDialog, setSocialProfileDialog] = useState({ visible: false, type: "", value: "" });
    const [periodDialog, setPeriodDialog] = useState({ visible: false, duration: "", price: "" });
    const [directLink, setDirectLink] = useState();

    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        init();
    }, [location]);

    const init = async () => {
        let res;
        res = await UserAPI.show(id);
        setUserData(res.data);

        res = await UserAPI.showFollwoing(id);
        setUserFollowingData(res.data);

        res = await UserAPI.showFollowers(id);
        setUserFollowers(res.data);

        getSocialProfile();
        getPeriod();
        getTag();
    }

    const getSocialProfile = async () => {
        const res = await UserSocialProfileAPI.show(id);
        setSocialProfils(res.data);
    }

    const getPeriod = async () => {
        const res = await UserPeriodAPI.show(id);
        setPeriod(res.data);
    }

    const getTag = async () => {
        const res = await MobileAppTagAPI.index(id);
        setTag(res.data);
    }

    const getDirectLink = async () => {
        const res = await UserAPI.influencerDirectLink(id);
        setDirectLink(res.data.link);
    }

    const _renderInfluencerHeader = () => {
        return (
            <div style={{ display: "flex", flex: 1, flexDirection: "column", padding: 16, overflow: "auto", backgroundColor: "white" }}>
                <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
                    <div style={{  }}>
                        <div>
                            {
                                userData.userDetail.profilePicture ?
                                    (
                                        <img src={userData.userDetail.profilePicture} style={{ height: 40, width: 40, borderRadius: 32 }} />
                                    ) :
                                    (
                                        <Typography align="center"> No profile picture set by influencer </Typography>
                                    )
                            }
                        </div>
                        <div>
                            {
                                userData.userDetail.coverImage ?
                                    (
                                        <img src={userData.userDetail.coverImage} style={{ height: 300 }} />
                                    ) :
                                    (
                                        <Typography align="center"> No cover image set by influencer </Typography>
                                    )
                            }
                        </div>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                        <Button
                            variant="contained"
                            color="primary"
                            style={{ marginRight: 16 }}
                            onClick={e => getDirectLink()}
                        >
                            Generate Direct Link
                        </Button>
                        {
                            userData.userDetail.type != "fan" ?
                                <Button variant="contained" style={{ marginRight: 16 }} color="primary" onClick={() => history.push("/influencer/" + userData.id + "/edit")}> Edit </Button> :
                                null
                        }
                        {
                            userData.userDetail.type != "fan" ?
                                <Button variant="contained" style={{ marginRight: 16 }} color="primary" onClick={() => history.push("/influencer/" + userData.id + "/question")}> Edit Questions </Button> :
                                null
                        }
                    </div>
                </div>
                <div style={{ }}>
                        <Typography>{directLink}</Typography>
                </div>
            </div>
        )
    }

    const _renderFanHeader = () => {
        return (
            <div style={{ display: "flex", flex: 1, flexDirection: "column", padding: 16, overflow: "auto", backgroundColor: "white" }}>
                <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
                    <div style={{  }}>
                        <div>
                        {
                            userData.userDetail.coverImage ?
                                (
                                    <img src={userData.userDetail.coverImage} style={{ height: "100%" }} />
                                ) :
                                (
                                        <Typography align="center"> No State Id Uploaded by the fan </Typography>
                                )
                        }
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const _renderHeader = () => {
        if (userData.userDetail.type == "fan") {
            return _renderFanHeader();
        } else {
            return _renderInfluencerHeader();
        }
    }

    const _renderPeriodRow = (period) => {
        return (
            <div style={{ display: "flex", flexDirection: "row", margin: 8, padding: 8 }}>
                <Typography style={{ flex: 1 }}>{period.duration}</Typography>
                <Typography style={{ flex: 1 }}>{period.price}</Typography>
                <DeleteIcon onClick={async () => {
                    await UserPeriodAPI.deletePeriod(id, period.id);
                    init();
                }} />
            </div>
        )
    }

    const _renderDuration = () => {
        if (userData.userDetail.type == "fan") return null;

        return (
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", marginTop: 8, marginBottom: 8 }}>
                    <Button variant="contained" color="primary" onClick={() => setPeriodDialog({ visible: true })} style={{ marginLeft: 16 }}>
                        Add
                    </Button>
                </div>
                <Divider />
                <div style={{ display: "flex", flexDirection: "row", margin: 8, padding: 8 }}>
                    <Typography style={{ flex: 1 }}>Duration</Typography>
                    <Typography style={{ flex: 1 }}>Price</Typography>
                </div>
                {
                    period.length > 0 ? period.map(eachPeriod => _renderPeriodRow(eachPeriod)) : <Typography>No Data</Typography>
                }
            </div>
        )
    }

    const _renderPersonalDetail = () => {
        return (
            <div style={{ display: "flex", flexDirection: "row", overflow: "auto", padding: 16, flex: 1 }}>
                <div style={{ flex: 2, padding: 16 }}>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 8 }}>
                        <Typography variant="subtitle2"> Name: </Typography>
                        <Typography variant="body2"> {userData.userDetail.firstName} {userData.userDetail.lastName}</Typography>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 8 }}>
                        <Typography variant="subtitle2"> Email: </Typography>
                        <Typography variant="body2"> {userData.email}</Typography>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 8 }}>
                        <Typography variant="subtitle2"> Number: </Typography>
                        <Typography variant="body2"> {userData.number}</Typography>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 8 }}>
                        <Typography variant="subtitle2"> Type: </Typography>
                        <Typography variant="body2"> {userData.userDetail.type}</Typography>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 8 }}>
                        <Typography variant="subtitle2"> {userData.userDetail.type == "fan" ? "Following" : "Followers"}: </Typography>
                        <Typography variant="body2"> {userData.userDetail.type == "fan" ? userFollowingData.length : userFollowers.length} </Typography>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 8 }}>
                        <Typography variant="subtitle2"> Status: </Typography>
                        <Typography variant="body2"> {userData.status ? "Active" : "Not Active"}</Typography>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 8 }}>
                        <Typography variant="subtitle2"> Test User: </Typography>
                        <Typography variant="body2"> {userData.testUser ? "Yes" : "No"}</Typography>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8, marginBottom: 8 }}>
                        <Typography variant="subtitle2"> Account Created At: </Typography>
                        <Typography variant="body2"> {userData.accountCreatedTime}</Typography>
                    </div>
                </div>
                <div style={{ flex: 1, padding: 16 }}>
                    { _renderDuration() }
                </div>
            </div>
        );
    };

    const _renderSocialProfileRow = (name) => {
        return (
            <div style={{ display: "flex", flexDirection: "row", margin: 8, padding: 8 }}>
                <Typography style={{ flex: 1, color: socialProfiles[name]?.generatedLink?.length > 0 ? PRIMARY_COLOR : "black" }} onClick={() => window.open(socialProfiles[name]?.generatedLink, "_blank")}>{name}</Typography>
                <Typography style={{ flex: 1 }}>{socialProfiles[name]?.text}</Typography>
                {
                    userData.userDetail.type != "fan" ?
                        <CreateIcon onClick={() => setSocialProfileDialog({ visible: true, type: name })} style={{ paddingLeft: 16, paddingRight: 16 }} /> :
                        null
                }
                {
                    userData.userDetail.type != "fan" ?
                        <DeleteIcon onClick={async () => {
                            await UserSocialProfileAPI.deleteProfile(id, { type: name })
                            getSocialProfile();
                        }} /> :
                        null
                }
            </div>
        )
    }

    const _renderTags = () => {
        if (userData.userDetail.type == "fan") return null;

        return (
            <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", margin: 8, padding: 8 }}>
                    {tag.map(eachTag => {
                        return (
                            <Chip
                                style={{ margin: 4 }}
                                label={eachTag.name}
                                clickable
                                onClick={async () => {
                                    await MobileAppTagAPI.store(id, eachTag.id, eachTag.selected ? 0 : 1)
                                    getTag();
                                }}
                                variant={eachTag.selected ? "default" : "outlined"}
                                color="primary"
                            />
                        );
                    })}
                </div>
            </div>
        )
    }

    const _renderSocialProfile = () => {
        return (
            <div style={{ display: "flex", flexDirection: "row", overflow: "auto", flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", overflow: "auto", padding: 16, flex: 2 }}>
                    <div style={{ flex: 1 }}>
                        {
                            ["linkedin", "instagram", "facebook", "tiktok", "twitter", "youtube"].map((name) => _renderSocialProfileRow(name))
                        }
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    { _renderTags() }
                </div>
            </div>
        )
    };

    

    const _renderFanFollowing = () => {
        return (
            userFollowingData.map(eachFollowing => {
                return (
                    <div onClick={() => history.push("/user/" + eachFollowing.id + "/detail")} style={{ display: "flex", justifyContent: "space-between", margin: 8, padding: 8 }}>
                        <Typography>{eachFollowing.userDetail.firstName} {eachFollowing.userDetail.lastName}</Typography>
                        <Typography>{eachFollowing.email}</Typography>
                        <Typography>{eachFollowing.number}</Typography>
                    </div>
                );
            })
        )
    }

    const _renderFollowers = () => {
        return (
            userFollowers.map(eachFollower => {
                return (
                    <div onClick={() => history.push("/user/" + eachFollower.id + "/detail")} style={{ display: "flex", justifyContent: "space-between", margin: 8, padding: 8 }}>
                        <Typography>{eachFollower.userDetail.firstName} {eachFollower.userDetail.lastName}</Typography>
                        <Typography>{eachFollower.email}</Typography>
                        <Typography>{eachFollower.number}</Typography>
                    </div>
                );
            })
        )
    }

    return (
        <Container>
            <div style={{ }}>
                <Typography variant="h5" align="center"> {userData.userDetail.type == "fan" ? "Fan" : "Influencer"} Details </Typography>
            </div>
            <div>
                { _renderHeader() }
            </div>
            <div className={classes.root}>
                <AppBar position="static">
                    <Tabs value={value} onChange={handleChange} aria-label="simple tabs example">
                        <Tab label="Pesonal Details" {...a11yProps(0)} />
                        <Tab label="Social Profile" {...a11yProps(1)} />
                        <Tab label="Followers" {...a11yProps(2)} />
                    </Tabs>
                </AppBar>
                <TabPanel value={value} index={0}>
                    {_renderPersonalDetail()}
                </TabPanel>
                <TabPanel value={value} index={1}>
                    {_renderSocialProfile()}
                </TabPanel>
                <TabPanel value={value} index={2}>
                    {_renderFollowers()}
                </TabPanel>
            </div>

            <Dialog open={socialProfileDialog.visible} onClose={() => setSocialProfileDialog({ visible: false })} aria-labelledby="form-dialog-title">
                <DialogContent>
                    <DialogContentText>
                        Set {socialProfileDialog.type} Account
                </DialogContentText>
                    <TextField
                        value={socialProfileDialog.value}
                        autoFocus
                        margin="dense"
                        label="Account"
                        type="text"
                        fullWidth
                        onChange={e => {
                            setSocialProfileDialog({ ...socialProfileDialog, value: e.target.value });
                            getSocialProfile();
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSocialProfileDialog({ visible: false })} color="primary">
                        Cancel
                </Button>
                    <Button onClick={async () => {
                        await UserSocialProfileAPI.store(id, { type: socialProfileDialog.type, value: socialProfileDialog.value })
                        setSocialProfileDialog({ visible: false });
                        init();
                    }} color="primary">
                        Set
                </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={periodDialog.visible} onClose={() => setPeriodDialog({ visible: false })} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Add Period</DialogTitle>
                <DialogContent>
                    <TextField
                        value={periodDialog.duration}
                        autoFocus
                        margin="dense"
                        label="Duration"
                        type="text"
                        fullWidth
                        onChange={e => setPeriodDialog({ ...periodDialog, duration: e.target.value })}
                    />
                    <TextField
                        value={periodDialog.price}
                        autoFocus
                        margin="dense"
                        label="Price"
                        type="text"
                        fullWidth
                        onChange={e => setPeriodDialog({ ...periodDialog, price: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPeriodDialog({ visible: false })} color="primary">
                        Cancel
                </Button>
                    <Button onClick={async () => {
                        await UserPeriodAPI.store(id, { duration: periodDialog.duration, price: periodDialog.price })
                        setPeriodDialog({ visible: false });
                        getPeriod();
                    }} color="primary">
                        Set
                </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
