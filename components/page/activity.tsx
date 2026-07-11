"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import NavigationBar from "../navigation-bar";
import { Wrench, Presentation, ScreenShare, Gamepad, Cog } from "lucide-react";
import { IActivity } from "../types/activity";
import Image from "next/image";
import { IEvent } from "../types/event";
import { ITicket } from "../types/ticket";
import axiosInstance from "@/lib/axios";
import FormatToRupiah from "@/lib/format-to-rupiah";
import { ICompetition } from "../types/competition";
import { TicketForm } from "../form/ticket-form";
import { Button } from "../ui/button";
import LoadingScreen from "../loading-screen";
import { isAfter } from "date-fns";
const fetcher = (url: string) => axiosInstance.get(url).then((res) => res.data);
interface ActivityProps extends IActivity {
  ticketSales?: ITicket[];
  competitions?: ICompetition[];
}

interface DetailProps {
  event: IEvent;
  activities: ActivityProps[];
}

const ActivityPage = () => {
  const [expiredActivities, setExpiredActivities] = useState<{ [key: number]: boolean }>({});
  const searchParams = useSearchParams();
  const eventIdFromUrl = searchParams.get("event");

  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    eventIdFromUrl ? Number(eventIdFromUrl) : null
  );
  const router = useRouter();

  const isTicket = (data: ITicket | ICompetition): data is ITicket => {
    return "name" in data;
  };

  const { data: eventData, error: eventError } = useSWR<{ data: IEvent }>(`/event/${eventIdFromUrl}`, fetcher);

  const { data: activitiesData, error: activityError } = useSWR<{ data: DetailProps }>(
    selectedEventId ? `/event/${selectedEventId}/detail` : null,
    fetcher
  );

  useEffect(() => {
    if (eventIdFromUrl) {
      setSelectedEventId(Number(eventIdFromUrl));
    }
  }, [eventIdFromUrl]);
  useEffect(() => {
    if (activitiesData?.data?.activities) {
      const now = new Date();

      const expiredStatus = activitiesData.data.activities.reduce((acc, activity) => {
        const endDate = new Date(activity.end_at);
        acc[activity.id] = isAfter(now, endDate);
        return acc;
      }, {} as { [key: number]: boolean });

      setExpiredActivities(expiredStatus);
    }
  }, [activitiesData]);
  console.log(setExpiredActivities)
  if (eventError) return <div className="text-white">Error loading events</div>;
  if (activityError) return <div className="text-white">Error loading activities</div>;
  if (!eventData) return <LoadingScreen />;

  const Card = ({ data, activity }: { data: ITicket | ICompetition, activity: IActivity }) => {
    return (
      <div className="w-full lg:pl-14">
        <div className="grid grid-cols-2 lg:grid-cols-3 items-center rounded-sm overflow-hidden">
          <div className="flex lg:flex-row col-span-1 px-2 lg:px-5 py-2 lg:items-center justify-center lg:justify-between min-h-[104px] lg:text-end text-start flex-col gap-2 bg-[#ff0000]">
            <div>
              <div className="flex items-center justify-center flex-col p-1 w-full relative border-4 border-white min-w-[4.8rem]">
                <div className="flex-shrink-0">
                  {getIcon(activity.type.id)}
                </div>
                <div className="flex-1 text-white text-center uppercase font-supertall text-sm">
                  {activity.type.name}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-white">Mulai {activity.start_at}</p>
              <p className="text-sm text-white max-w-64">Lokasi di {activity.location}</p>
              <p className="text-sm text-white font-bold">Total Quota: {data.quantity}</p>
            </div>
          </div>
          <div className="bg-white flex px-2 py-2 lg:py-0 flex-col lg:px-5 lg:justify-between lg:flex-row h-full justify-between lg:items-center gap-3 lg:gap-0 lg:col-span-2 lg:p-2 font-supertall text-xl">
            <div className="flex flex-col lg:py-3">
              <p className="font-medium text-lg lg:text-2xl text-[#ff0000]">{'name' in data ? `${data.name}` : `${(data as ICompetition).game.name}`}</p>
              <div className="flex flex-col lg:flex-row">
                <p className="text-sm lg:text-base font-sans capitalize font-semibold">{activity.type.name} | {activity.type.flow}</p>
                <p className="hidden lg:flex font-sans text-base px-1 font-semibold">{" - "}</p>
                <p className="text-sm lg:text-base text-black font-sans font-semibold">{FormatToRupiah(data.price)}/pcs</p>
              </div>
            </div>
            <div className="font-sans flex text-sm">
              {isTicket(data) ? (
                <TicketForm data={data} ticketID={data.id} />
              ) : (
                <Button
                  onClick={() => router.push(`/competition/register?id=${data.id}`)}
                  className="w-full text-white rounded-sm font-semibold hover:text-[#ff0000] bg-[#ff0000] justify-center items-center text-center p-3 transition-all hover:border-[#ff0000] border-transparent border hover:bg-transparent disabled:bg-red-700"
                  disabled={!data.status?.data.is_open || expiredActivities[data.id]}
                >
                  {expiredActivities[data.id]
                    ? `Event berakhir`
                    : !data.status?.data.is_open
                      ? `Segera Hadir`
                      : `Daftar Sekarang`}
                </Button>
              )}
            </div>

          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:py-[56px] lg:px-[80px] h-full w-full">
      <div
        className={cn(
          "bg-[url('/images/optimized/backdrop_1.png')]",
          "absolute lg:top-1/2 lg:right-[5rem] lg:transform lg:-translate-y-1/2 w-[400px] bg-no-repeat lg:w-[707px] h-[471px] bg-contain z-0 bg-gray-900 bg-blend-lighten",
          "top-[30%] lg:top-1/2 right-0"
        )}
      />
      <NavigationBar />
      <div className="text-black px-5 py-5 relative z-20 lg:pt-10">

        <div className="flex items-center gap-2 font-supertall">
          <Image alt="" src={eventData.data.event_logo ?? "/images/logo.png"} width={50} height={50} className="p-0.5 bg-white rounded-sm" />
          <p className="uppercase text-white lg:text-2xl">{eventData.data.name.length > 50 ? `${eventData.data.name.slice(0, 50)}...` : eventData.data.name}</p>
        </div>

        {selectedEventId && activitiesData ? (
          activitiesData.data.activities.length > 0 ? (
            activitiesData.data.activities.map((activity, index) => (
              <div key={index} className="pb-5">
                <div className="flex justify-between items-center relative z-20 py-5">
                  <span className="text-base text-black w-full md:w-fit py-1 px-3 rounded-sm bg-white text-center font-supertall">
                    {activity.name}
                  </span>
                  <span className="flex-grow h-0.5 bg-white rounded-lg ml-3 hidden lg:block"></span>
                </div>
                <div className="mt-2 space-y-4 w-full h-full relative z-20">
                  {(activity.ticketSales || activity.competitions) ? (
                    <>
                      {activity.ticketSales && activity.ticketSales.map((ticket) => (
                        <Card key={ticket.id} data={ticket} activity={activity} />
                      ))}
                      {activity.competitions && activity.competitions.map((competition) => (
                        <Card key={competition.id} data={competition} activity={activity} />
                      ))}
                    </>
                  ) : (
                    <p className="lg:ml-14 text-start lg:text-lg text-white mt-5 font-supertall">Akan Segera Hadir</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center lg:text-start lg:text-lg text-white mt-5 font-supertall flex gap-2"><Cog /> Akan Segera Hadir</p>
          )
        ) : null}
      </div>
    </div>
  );
}

export default ActivityPage;

const getIcon = (typeId: number) => {
  switch (typeId) {
    case 1:
      return <Wrench className="w-9 h-9 text-white" />;
    case 2:
      return <Presentation className="w-9 h-9 text-white" />;
    case 3:
      return <Gamepad className="w-9 h-9 text-white" />;
    case 4:
      return <ScreenShare className="w-9 h-9 text-white" />;
    default:
      return <Wrench className="w-9 h-9 text-white" />;
  }
};
