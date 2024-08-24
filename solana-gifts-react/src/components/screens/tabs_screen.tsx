import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
} from "@material-tailwind/react";
import Connect from "../connect/connect";
import CreateGift from "../create/create_gift";
import RedeemGift from "../redeem/redeem_gift";

function TabsScreen() {
  const data = [
    {
      label: "Create",
      value: "create",
    },
    {
      label: "Redeem",
      value: "redeem",
    },
  ];

  return (
    <Card
      color="indigo"
      variant="gradient"
      className="w-full max-w-[35rem] p-8" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}    >
      <Tabs id="custom-animation" value="create">
        <CardHeader
          floated={false}
          shadow={false}
          color="transparent"
          className="m-0 mb-8 rounded-none border-b border-white/10 pb-10 text-center" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}        >
          <TabsHeader placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
            {data.map(({ label, value }) => (
              <Tab key={value} value={value} placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
                {label}
              </Tab>
            ))}
          </TabsHeader>
        </CardHeader>
        <CardBody className="p-0" placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}>
          <TabsBody
            animate={{
              initial: { y: 250 },
              mount: { y: 0 },
              unmount: { y: 250 },
            }}  placeholder={undefined} onPointerEnterCapture={undefined} onPointerLeaveCapture={undefined}          >
            <TabPanel key={"create"} value={"create"}>
              <CreateGift></CreateGift>
            </TabPanel>
            <TabPanel key={"redeem"} value={"redeem"}>
              <RedeemGift></RedeemGift>
            </TabPanel>
          </TabsBody>
        </CardBody>
      </Tabs>

      <div>
        <Connect></Connect>
      </div>
    </Card>
  );
}

export default TabsScreen;