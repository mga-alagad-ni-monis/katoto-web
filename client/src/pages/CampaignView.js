import { useState, useEffect } from "react";
import axios from "../api/axios";
import { Swiper, SwiperSlide } from "swiper/react";

import { Markup } from "interweave";

import "swiper/css";
import "swiper/css/pagination";

import { Pagination } from "swiper";

import { IoChevronBackOutline } from "react-icons/io5";

import katotoWatch from "../assets/katoto/katoto-watch.png";

function CampaignView({ token, auth, toast }) {
  const [campaigns, setCampaigns] = useState([]);

  const [campaignInfo, setCampaignInfo] = useState("");

  const [isShow, setIsShow] = useState(false);

  const [quote, setQuote] = useState({});

  useEffect(() => {
    handleGetPublishedCampaign();
    getQuote();
  }, []);

  const getQuote = async () => {
    await axios
      .get("/api/train/get-quote", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${auth?.accessToken}`,
        },
      })
      .then((res) => {
        console.log(res?.data?.quote);
        setQuote(res?.data?.quote);
      })
      .catch((err) => {
        toast.error(err?.response?.data);
      });
  };

  const handleGetPublishedCampaign = async () => {
    try {
      await axios
        .get("/api/campaigns/get-published", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          console.log(res);
          setCampaigns(res?.data?.campaigns);
        });
    } catch (err) {}
  };

  return (
    <div className="bg-[--light-brown] min-h-screen pt-24">
      <div className="flex flex-col px-52">
        {isShow ? (
          <div className="pt-20">
            <div className="w-full pb-12">
              <button
                className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
                onClick={() => {
                  setIsShow(false);
                }}
              >
                <IoChevronBackOutline size={16} />
                Back
              </button>
            </div>
            <Markup content={campaignInfo} />
          </div>
        ) : (
          <>
            <p className="mt-16 flex w-full text-3xl font-extrabold mb-8 justify-center">
              Campaigns
            </p>
            <div className="flex w-full gap-5">
              <div className="w-1/3 flex flex-col gap-5 max-screen">
                <p className="font-extrabold">Upcoming Campaigns</p>
                {campaigns?.map((i, k) => {
                  return (
                    <div
                      key={k}
                      className="bg-[--light-green] rounded-xl py-4 px-6 shadow-lg"
                    >
                      <p className="bg-[--dark-green] text-[--light-green] font-semibold rounded-lg w-max p-2 py-1 text-xs">
                        {i?.campaignType}
                      </p>
                      <div className="mt-3 font-extrabold">{i?.title}</div>
                      <div className="flex justify-between">
                        <div className="mt-3 font-semibold text-sm">
                          Until: {i?.effectivityDate}
                        </div>
                        <button
                          className="bg-[--dark-green] rounded-full font-semibold text-sm text-[--light-green] px-3 py-1 border-2 border-[--dark-green] 
                    hover:bg-[--light-green] hover:text-[--dark-green] transition-all duration-300"
                          onClick={() => {
                            setIsShow(true);
                            setCampaignInfo(i?.campaignInfo);
                          }}
                        >
                          See More
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Swiper
                pagination={{
                  dynamicBullets: true,
                }}
                modules={[Pagination]}
                className="mySwiper w-1/3 rounded-xl -mt-[60px]"
              >
                {campaigns?.map((i, k) => {
                  return (
                    <SwiperSlide
                      key={k}
                      onClick={() => {
                        setIsShow(true);
                        setCampaignInfo(i?.campaignInfo);
                      }}
                    >
                      <div className="flex justify-center items-center h-[600px] w-full">
                        <img
                          src={i?.imageHeader}
                          alt=""
                          className="flex justify-center items-center cursor-pointer"
                        />
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
              <div className="relative mt-36">
                <img
                  src={katotoWatch}
                  alt="katoto"
                  className="h-[270px] absolute -top-[250px] right-1/2 translate-x-1/2"
                />
                <div className="h-max w-[350px] bg-[--light-brown] rounded-2xl border-2 border-black/10 shadow-lg pt-10 pb-5 px-5">
                  <p className="text-2xl font-extrabold flex justify-center mb-5">
                    Quote of the Day
                  </p>
                  <div className="bg-[--light-green] px-5 py-8 rounded-lg text-center font-semibold text-lg">
                    {quote?.quote}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CampaignView;
