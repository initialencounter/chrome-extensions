export interface SummaryInfo {
  // 标题
  title: string,
  // 项目编号
  projectNo: string,
  // 签发日期
  issueDate: string,
  capacity: string;
  classification: string;
  cnName: string;
  color: string;
  consignor: string;
  consignorInfo: string;
  enName: string;
  id: string;
  licontent: string;
  manufacturer: string;
  manufacturerInfo: string;
  mass: string;
  note: string;
  projectId: string;
  shape: string;
  test1: string;
  test2: string;
  test3: string;
  test4: string;
  test5: string;
  test6: string;
  test7: string;
  test8: string;
  testDate: string;
  testlab: string;
  testlabInfo: string;
  testManual: string;
  testReportNo: string;
  trademark: string;
  type: string;
  un38f: string;
  un38g: string;
  voltage: string;
  watt: string;
}

export interface GoodsInfo {
  projectNo: string;
  name: string;
  labels: string[];
}

export interface AttachmentInfo {
  summary: SummaryInfo;
  goods: GoodsInfo;
}