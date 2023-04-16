import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
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
      className="w-full max-w-[35rem] p-8"
    >
      <Tabs id="custom-animation" value="create">
        <CardHeader
          floated={false}
          shadow={false}
          color="transparent"
          className="m-0 mb-8 rounded-none border-b border-white/10 pb-10 text-center"
        >
          <TabsHeader>
            {data.map(({ label, value }) => (
              <Tab key={value} value={value}>
                {label}
              </Tab>
            ))}
          </TabsHeader>
        </CardHeader>
        <CardBody className="p-0">
          <TabsBody
            animate={{
              initial: { y: 250 },
              mount: { y: 0 },
              unmount: { y: 250 },
            }}
          >
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
