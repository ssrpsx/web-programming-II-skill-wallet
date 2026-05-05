overview website
เป็น website skill wallet โดยมีการ prove 3 ระดับ ได้แก่

1. test เป็นข้อสอบ 20ข้อ
2. peer to peer ที่ให้ user มา prove ทักษะให้กันเอง
3. interview โดยผู้เชี่ยวชาญ

ให้ mooc link discord มา โดยจะมีห้องดังนี้ 1.p2p ห้อง 1, p2p ห้อง 2, P2p ห้อง3, interview ห้อง 1, interview ห้อง 2, interview ห้อง 3

to do
1. ให้นำ question/*.json มา merge กันเป็น 1 ไฟล์
2. ให้ทำหน้าเว็บที่แสดงข้อสอบออกมาให้ครบ 20ข้อ โดยมีหัวข้อของราย skill แยกหัวข้อ
3. ปุ่ม new Verification (/html/body/div[2]/main/div/div[1]/div/button) กดแล้วให้ขึ้นหัวข้อแต่ละรายวิชาใน json file และเลือกทำข้อสอบได้เลยกำหนด timeout ตามไฟล์ json ("Time": ?)
4. ลบ /html/body/div[2]/div[1]/div[2]/div/div[2]/div[1], /html/body/div[2]/main/div/div[2]/div[1] ออกไป
5. Verified Skills คือดูความสำเร็จที่ทำเสร็จแล้ว (ทั้ง test ,peer to peer ,interview)
6. Highest Level คือจำนวน skill ที่ verify ผ่านหมดแล้วทั้ง 3 ระดับ
7. Pending Tasks เปลี่ยนเป็น จำนวนที่เราต้องไปตรวจ (peer to peer, interview) ผู้อื่น
8. เพิ่มระบบยศเข้าไปด้วยเป็น user, interviewer
9. ระบบ peer to peer ให้ทำการสุ่ม user ที่ verify สกิลนั้นแล้ว 2 คน และส่งอีเมลไปบอกว่่าจะมีการ P2P ณ เวลา ใดๆ ที่ลิ้ง Discord ณ ห้องที่ว่างในเวลาที่นัดหมาย
10. ระบบ interview ทำเหมือนกับ p2p แต่เป็นuserที่มียศ interviewer เท่านั้น

11. ทำไมตอนกด get start, sigh in มันถึงไม่เช็คว่า user ได้ทำการ login แล้ว มันดันเข้าไปหน้า dashboard เลย ทั้งๆที่ยังไม่ได้ login
12. /html/body/div[2]/div[1]/div[2]/div/div[2]/div[1]/ul ลบให้หน่อย
13. พอทำ Test 1ครั้งแล้วไม่ผ่าน ใส่ delay การทำ test อีกครั้งเป็น 1 วัน

- [x] 14. นำพอร์ต 8080, 8081, 3000 ที่แมพออกมาไปใส่ .env เพื่อที่จะปรับง่ายๆ
- [x] 15. นำ docker .env ไปใส่ .env
- [x] 16. ลิ้งเข้าร่วมดิสคอร์ด และ ห้องต่างๆ ไปจัดเก็บไว้ใน .env 
- [x] 17. ทำไมพอทำ Test  ผ่านแล้วไม่ได้ Skill level 1 มันไม่มีอะไรเกิดขึ้นเลย (ไม่ถูกบันทึก)
- [x] 18. กำหนด id interview ไว้ด้วย 1 id ไว้เทส interview email, id user ที่ verify 1 สกิล 2id ไว้เทส peer to peer email และปุ่ม approve, denied (ขอทั้งสองปุ่ม) ให้สามารถกดเพื่อยืนยัน เมื่อ p2p เสร็จสิ้น หรือ interview เสร็จสิ้น

19. คือพอ docker compose up -d --build แล้วพอเข้าไปที่ http://localhost:3000/app มันมี Token ถูกแอดเข้ามาตลอดเลย ซึ่งหน้าเว็บมันก็ Unable to load user data อยากให้ลบการAdded Token ตัวนี้ออกไป
20. Level 2 สร้างหน้าให้กดเข้าดิสคอร์ด แล้วก็ให้ user comfirm ว่าเข้าดิสคอร์ดแล้วหน้าต่อไปก็จะบอกวิธีการ p2p 1.ให้เข้าดิสคอร์ดและตั้งชื่อ (firstname-lastname ให้ดึงมาจากระบบเพื่อบอกuser) 2.ในขณะเดียวกันให้ระบบสุ่มหาคน p2p 1 คนที่ verify skill นั้น และแสดงชื่อคนที่ต้องp2p ให้กับ user ที่กำลังจะ verify แล้วให้user แท็กชื่อคนที่ต้องp2p นัดหมายวันเวลาที่จะ p2p กันเอง  แล้วให้ระบบส่งอีเมลไปหาเขา(คนที่ต้องมา P2P) (ปล. ต้องหาคนที่ทำ Test ผ่านแล้วเท่านั้น) และ ส่งลิ้ง verify ไปด้วย มี 2 ปุ่ม Approve, Denied (ทั้งสองปุ่มต้องกดได้)